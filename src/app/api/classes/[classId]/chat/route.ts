import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import { InteractionModel } from '@/models/Interaction';
import connectDB from '@/lib/db/mongodb';
import { searchDocuments } from '@/lib/ai/supabase-embeddings';
import Groq from 'groq-sdk';

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

    // Query documents using embeddings from Supabase
    try {
      const searchResults = await searchDocuments(classId, question, 5);
      const context = searchResults.map(r => r.content).join('\n\n');
      
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const systemPrompt = `Eres un asistente educativo especializado en la clase: ${classDoc.name}
      
Tienes acceso a documentos de la clase. Usa el siguiente contexto para responder preguntas de forma clara, educativa y amigable.

CONTEXTO DE DOCUMENTOS:
${context || 'No hay documentos disponibles aún.'}

Instrucciones:
- Si la pregunta está relacionada con el contexto, usa ese información
- Si no encuentras información en el contexto, di que no encontraste esa información en los documentos
- Siempre sé educativo y alentador
- Explica conceptos de forma clara y accesible`;

      const message = await groq.messages.create({
        model: 'mixtral-8x7b-32768',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: question
          }
        ],
        system: systemPrompt,
      });

      const answer = message.content[0].type === 'text' ? message.content[0].text : 'No se pudo generar una respuesta';
      
      // Guardar interacción en la base de datos
      await InteractionModel.create({
        usuario_id: session.user.id,
        clase_id: classId,
        pregunta: question,
        respuesta: answer,
        sources: searchResults.map(r => r.documentId) || [],
        fecha: new Date()
      });
      
      // Return formatted response
      return NextResponse.json({ 
        success: true,
        answer, 
        sources: searchResults 
      });
    } catch (embeddingError) {
      console.error('Error en búsqueda de embeddings:', embeddingError);
      
      let errorAnswer = 'Lo siento, hubo un problema al procesar tu pregunta. Esto puede deberse a que los documentos aún están siendo procesados. Por favor, intenta nuevamente en unos momentos.';
      
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