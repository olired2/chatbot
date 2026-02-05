import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';
import { generateEmbedding, storeEmbeddings, DocumentChunk } from '@/lib/ai/supabase-embeddings';

export const dynamic = 'force-dynamic';

/**
 * Divide texto en chunks
 */
function splitTextIntoChunks(
  text: string,
  chunkSize: number = 500,
  overlap: number = 100
): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.substring(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  let originalLog = console.log;
  let originalWarn = console.warn;
  
  try {
    const { classId } = await params;
    
    // Verificar que es una llamada interna (con token secreto)
    const authHeader = req.headers.get('authorization');
    const internalToken = process.env.CRON_SECRET_TOKEN || 'default-secret';
    
    // Permitir desde el mismo servidor o con token válido
    const isInternal = authHeader === `Bearer ${internalToken}`;
    let session = null;
    
    if (!isInternal) {
      session = await getServerSession(authOptions);
      
      // Verificar autenticación
      if (!session || session.user.role !== 'Maestro') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
    }

    await connectDB();

    // Verificar que la clase existe y pertenece al maestro (solo si no es llamada interna)
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }

    if (!isInternal && session && classDoc.teacher.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta clase' },
        { status: 403 }
      );
    }

    const { documentId, documentUrl } = await req.json();

    if (!documentId || !documentUrl) {
      return NextResponse.json(
        { error: 'documentId y documentUrl son requeridos' },
        { status: 400 }
      );
    }

    console.log(`📄 Procesando PDF: ${documentUrl}`);
    console.log(`📋 documentId: ${documentId}`);
    console.log(`📋 documentUrl: ${documentUrl}`);
    console.log(`📋 classId: ${classId}`);

    // Descargar el PDF desde la URL
    const pdfResponse = await fetch(documentUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Error descargando PDF: ${pdfResponse.statusText}`);
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // Parsear el PDF con pdf2json
    const PDFParser = (await import('pdf2json')).default;
    
    // Suprimir logs de warnings de pdf2json
    const filterLogs = (...args: any[]) => {
      const message = args.join(' ');
      // Filtrar warnings comunes de pdf2json
      if (
        message.includes('NOT valid form') ||
        message.includes('Unsupported: field.type') ||
        message.includes('Setting up fake worker') ||
        message.includes('TT: undefined function') ||
        message.includes('undefined function')
      ) {
        return false; // No mostrar estos logs
      }
      return true; // Mostrar otros logs
    };
    
    console.log = (...args: any[]) => {
      if (filterLogs(...args)) {
        originalLog(...args);
      }
    };
    
    console.warn = (...args: any[]) => {
      if (filterLogs(...args)) {
        originalWarn(...args);
      }
    };
    
    try {
      const fullText = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          reject(new Error(`PDF parsing error: ${errData.parserError}`));
        });
        
        pdfParser.on('pdfParser_dataReady', () => {
          try {
            let text = '';
            
            const data = pdfParser.data as any;
            if (data && data.Pages) {
              for (const page of data.Pages) {
                if (page.Texts) {
                  for (const textObj of page.Texts) {
                    if (textObj.R && textObj.R[0] && textObj.R[0].T) {
                      try {
                        // Intentar decodificar, si falla usar el texto tal cual
                        text += decodeURIComponent(textObj.R[0].T) + ' ';
                      } catch (decodeError) {
                        // Si falla el decode, usar el texto sin decodificar
                        text += textObj.R[0].T.replace(/%20/g, ' ').replace(/%[0-9A-Fa-f]{2}/g, '') + ' ';
                      }
                    }
                  }
                }
              }
            }

            resolve(text);
          } catch (error) {
            reject(error);
          }
        });
        
        pdfParser.parseBuffer(pdfBuffer);
      });

      // Restaurar console.warn después del Promise
      console.warn = originalLog;

      if (fullText.trim().length === 0) {
        return NextResponse.json(
          { error: 'No se pudo extraer texto del PDF' },
          { status: 400 }
        );
      }

      console.log(`📝 Texto extraído: ${fullText.length} caracteres`);

      // Dividir en chunks
      const chunks = splitTextIntoChunks(fullText, 500, 100);
      console.log(`✂️ Documento dividido en ${chunks.length} fragmentos`);

      // Marcar como procesado en MongoDB (antes de esperar embeddings)
      console.log(`📝 Marcando documento como procesado en MongoDB...`);
      console.log(`🔍 Buscando documento con path: ${documentUrl}`);
      
      const updateResult = await ClassModel.findByIdAndUpdate(
        classId,
        {
          $set: {
            'documents.$[doc].processed': true,
            'documents.$[doc].processedAt': new Date(),
          },
        },
        {
          arrayFilters: [{ 'doc.path': documentUrl }],
          new: true // Retornar el documento actualizado
        }
      );
      
      console.log(`✅ Documento marcado como procesado`);
      console.log(`📊 Resultado de actualización:`, updateResult?.documents?.filter((d: any) => d.path === documentUrl));

      // Procesar embeddings en background (sin esperar)
      console.log(`⏳ Iniciando procesamiento de embeddings en background...`);
      
      // Fire and forget - procesamiento en background
      (async () => {
        try {
          console.log(`🔄 Procesando embeddings en background para ${chunks.length} chunks...`);
          
          // Generar embeddings para cada chunk
          const embeddingPromises = chunks.map((chunk, index) => 
            generateEmbedding(chunk)
              .then(embedding => ({
                classId,
                documentId: documentId || documentUrl,
                chunkIndex: index,
                content: chunk,
                embedding
              }))
              .catch(err => {
                console.error(`❌ Error generando embedding para chunk ${index}:`, err);
                return null;
              })
          );
          
          const results = await Promise.all(embeddingPromises);
          const successfulEmbeddings = results.filter((r): r is DocumentChunk => r !== null);
          
          if (successfulEmbeddings.length > 0) {
            console.log(`✅ Generados ${successfulEmbeddings.length}/${chunks.length} embeddings`);
            
            // Guardar embeddings en la base de datos
            await storeEmbeddings(successfulEmbeddings);
            
            // Marcar documento como completamente procesado
            await ClassModel.findByIdAndUpdate(
              classId,
              {
                $set: {
                  'documents.$[doc].embeddings': true,
                },
              },
              {
                arrayFilters: [{ 'doc.path': documentUrl }],
              }
            );
            
            console.log(`🎉 Documento completamente procesado: ${documentUrl}`);
          } else {
            console.warn(`⚠️ No se pudieron generar embeddings para ${documentUrl}`);
          }
        } catch (error) {
          console.error(`❌ Error en procesamiento de embeddings en background:`, error);
        }
      })();
      
      return NextResponse.json({
        success: true,
        message: 'Documento recibido. Procesando embeddings en background...',
        chunks: chunks.length,
      });
    } finally {
      // Restaurar console en caso de error
      console.log = originalLog;
      console.warn = originalWarn;
    }
  } catch (error) {
    console.error('❌ Error procesando documento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        error: 'Error al procesar documento',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
