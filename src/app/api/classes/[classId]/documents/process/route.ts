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

    // Descargar el PDF desde la URL
    const pdfResponse = await fetch(documentUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Error descargando PDF: ${pdfResponse.statusText}`);
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // Parsear el PDF con pdf2json
    const PDFParser = (await import('pdf2json')).default;
    
    const fullText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);
      
      // Suprimir logs de warnings de pdf2json
      const originalLog = console.warn;
      console.warn = (...args: any[]) => {
        const message = args.join(' ');
        if (!message.includes('NOT valid form') && !message.includes('Unsupported: field.type')) {
          originalLog(...args);
        }
      };
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.warn = originalLog; // Restaurar console.warn
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
          console.warn = originalLog; // Restaurar console.warn
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

    // Generar embeddings en lotes para evitar timeout
    const BATCH_SIZE = 10; // Procesar 10 chunks a la vez
    let totalProcessed = 0;

    for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunks.length);
      const batchChunks = chunks.slice(batchStart, batchEnd);
      
      console.log(`⏳ Procesando lote ${Math.floor(batchStart/BATCH_SIZE) + 1}/${Math.ceil(chunks.length/BATCH_SIZE)} (chunks ${batchStart + 1}-${batchEnd})...`);

      // Generar embeddings para este lote
      const embeddingChunks: DocumentChunk[] = [];
      
      for (let i = 0; i < batchChunks.length; i++) {
        const globalIndex = batchStart + i;
        const embedding = await generateEmbedding(batchChunks[i]);

        embeddingChunks.push({
          classId,
          documentId,
          chunkIndex: globalIndex,
          content: batchChunks[i],
          embedding,
        });
      }

      // Guardar este lote inmediatamente en Supabase
      await storeEmbeddings(embeddingChunks);
      totalProcessed += embeddingChunks.length;
      console.log(`✅ Lote guardado. Total: ${totalProcessed}/${chunks.length} embeddings`);
    }

    console.log(`✅ Todos los ${totalProcessed} embeddings guardados en Supabase`);

    // Actualizar documento en MongoDB para marcar como procesado
    console.log(`📝 Actualizando documento en MongoDB...`);
    const updateResult = await ClassModel.findByIdAndUpdate(
      classId,
      {
        $set: {
          'documents.$[doc].embeddings': true,
          'documents.$[doc].processed': true,
          'documents.$[doc].processedAt': new Date(),
        },
      },
      {
        arrayFilters: [{ 'doc.path': documentUrl }],
      }
    );
    console.log(`✅ Documento marcado como procesado en MongoDB`);

    return NextResponse.json({
      success: true,
      message: 'Documento procesado exitosamente',
      chunks: chunks.length,
    });
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
