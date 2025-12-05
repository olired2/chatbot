import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import { InteractionModel } from '@/models/Interaction';
import connectDB from '@/lib/db/mongodb';
import { queryDocuments } from '@/lib/ai/embeddings';

// Marcar como dinámico
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await connectDB();
    
    const { question } = await req.json();
    
    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'La pregunta no puede estar vacía' }, { status: 400 });
    }

    // Verify student is in the class
    const classDoc = await ClassModel.findOne({
      _id: classId,
      students: session.user.id
    });
    
    if (!classDoc) {
      return NextResponse.json({ error: 'Clase no encontrada o no tienes acceso' }, { status: 404 });
    }

    // Verificar que haya documentos en la clase
    if (!classDoc.documents || classDoc.documents.length === 0) {
      const noDocsAnswer = 'Lo siento, aún no hay documentos disponibles en esta clase. Tu profesor debe subir documentos para que pueda ayudarte.';
      
      // Guardar interacción incluso sin documentos
      await InteractionModel.create({
        usuario_id: session.user.id,
        clase_id: classId,
        pregunta: question,
        respuesta: noDocsAnswer,
        fecha: new Date()
      });
      
      return NextResponse.json({
        answer: noDocsAnswer,
        sources: []
      });
    }

    // Query documents using embeddings
    try {
      const results = await queryDocuments(classId, question, classDoc.name);
      
      if (!results) {
        throw new Error('No se pudieron procesar los documentos');
      }
      
      // Guardar interacción en la base de datos
      await InteractionModel.create({
        usuario_id: session.user.id,
        clase_id: classId,
        pregunta: question,
        respuesta: results.answer,
        sources: results.sources?.map((s: { pageContent?: string }) => s.pageContent || '') || [],
        fecha: new Date()
      });
      
      // Return formatted response
      return NextResponse.json({ 
        success: true,
        answer: results.answer, 
        sources: results.sources 
      });
    } catch (embeddingError) {
      console.error('Error en embeddings:', embeddingError);
      
      let errorAnswer = 'Lo siento, hubo un problema al procesar tu pregunta. Esto puede deberse a que los documentos aún están siendo procesados. Por favor, intenta nuevamente en unos momentos.';
      
      // Detectar si es un error de rate limit
      if (embeddingError instanceof Error && embeddingError.message.includes('rate_limit_exceeded')) {
        errorAnswer = '🚫 **Límite de consultas diario alcanzado**\n\nHemos alcanzado el límite de consultas por hoy. El servicio estará disponible nuevamente mañana.\n\n**Mientras tanto puedes:**\n• Revisar los documentos de clase descargados\n• Consultar tus apuntes\n• Preparar preguntas para mañana\n\n¡Gracias por tu comprensión! 😊';
      }
      
      // Guardar error también
      await InteractionModel.create({
        usuario_id: session.user.id,
        clase_id: classId,
        pregunta: question,
        respuesta: errorAnswer,
        fecha: new Date()
      });
      
      return NextResponse.json({
        answer: errorAnswer,
        sources: []
      });
    }
  } catch (error) {
    console.error('Error in chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      error: 'Error al procesar la pregunta',
      details: errorMessage 
    }, { status: 500 });
  }
}