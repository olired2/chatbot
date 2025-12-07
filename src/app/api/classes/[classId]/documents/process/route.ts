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
    const pdfData = new Uint8Array(pdfArrayBuffer);

    // Parsear el PDF dinámicamente con pdfjs
    const pdfjsLib = await import('pdfjs-dist');
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => (item.str ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

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

    // Generar embeddings para cada chunk
    const embeddingChunks: DocumentChunk[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`⏳ Generando embedding ${i + 1}/${chunks.length}...`);

      const embedding = await generateEmbedding(chunks[i]);

      embeddingChunks.push({
        classId,
        documentId,
        chunkIndex: i,
        content: chunks[i],
        embedding,
      });

      // Pequeño delay para evitar rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Almacenar en Supabase
    await storeEmbeddings(embeddingChunks);

    // Actualizar documento en MongoDB para marcar como procesado
    await ClassModel.findByIdAndUpdate(
      classId,
      {
        $set: {
          'documents.$[doc].processed': true,
          'documents.$[doc].processedAt': new Date(),
        },
      },
      {
        arrayFilters: [{ 'doc.path': documentUrl }],
      }
    );

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
