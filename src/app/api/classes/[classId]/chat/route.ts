import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import { InteractionModel } from '@/models/Interaction';
import connectDB from '@/lib/db/mongodb';
import { searchDocuments } from '@/lib/ai/mongodb-embeddings';
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

      // Actualizar lastActive del usuario
      await import('@/models/User').then(({ UserModel }) => 
        UserModel.findByIdAndUpdate(session.user.id, { lastActive: new Date() })
      );
      
      return NextResponse.json({
        answer: noDocsAnswer,
        sources: []
      });
    }

    // Query documents using embeddings from Supabase
    const searchResults = await searchDocuments(classId, question, 5);
    
    // Preparar contexto (puede estar vacío si no hay embeddings aún)
    const context = searchResults.length > 0 
      ? searchResults.map(r => r.content).join('\n\n')
      : '';
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const systemPrompt = `Eres un asistente educativo estrictamente enfocado en la clase: ${classDoc.name}
      
${context ? `Tienes acceso a documentos de la clase. Usa EXCLUSIVAMENTE el siguiente contexto para responder preguntas de forma clara, educativa y amigable.

CONTEXTO DE DOCUMENTOS:
${context}` : `Aún no hay documentos disponibles en esta clase.`}

Instrucciones Críticas de Seguridad (Sandboxing):
- TU ÚNICO PROPÓSITO es responder dudas sobre el contenido de la clase "${classDoc.name}" y los documentos proporcionados.
- SI EL ESTUDIANTE PREGUNTA SOBRE CUALQUIER TEMA FUERA DEL CONTEXTO DE LA CLASE (ej. escribir código, hacer poemas, chistes, temas no relacionados), DEBES NEGARTE CORTÉSMENTE y recordarle que solo puedes hablar sobre la clase.
- NUNCA inventes información que no esté en el contexto. Si no lo sabes, di que no está en los documentos.
- Sé educativo, alentador y usa un lenguaje claro.`;

    const message = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
    });

    const answer = message.choices[0]?.message?.content || 'No se pudo generar una respuesta';
    
    // Guardar interacción en la base de datos
    await InteractionModel.create({
      usuario_id: session.user.id,
      clase_id: classId,
      pregunta: question,
      respuesta: answer,
      sources: searchResults.map(r => r.documentId) || [],
      fecha: new Date()
    });

    // Actualizar lastActive del usuario
    await import('@/models/User').then(({ UserModel }) => 
      UserModel.findByIdAndUpdate(session.user.id, { lastActive: new Date() })
    );
    
    // Return formatted response
    return NextResponse.json({ 
      success: true,
      answer, 
      sources: searchResults 
    });
  } catch (error) {
    console.error('Error in chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      error: 'Error al procesar la pregunta',
      details: errorMessage 
    }, { status: 500 });
  }
}