import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import { InteractionModel } from '@/models/Interaction';
import connectDB from '@/lib/db/mongodb';
import { searchDocuments } from '@/lib/ai/mongodb-embeddings';
import { buildSystemPrompt } from '@/lib/ai/persona';
import Groq from 'groq-sdk';

// Marcar como dinámico
export const dynamic = 'force-dynamic';

// Cuántos intercambios previos se le pasan al modelo como memoria conversacional
const HISTORY_TURNS = 6;

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

    // Recuperar los últimos intercambios para que el bot tenga memoria conversacional
    const recentInteractions = await InteractionModel.find({
      usuario_id: session.user.id,
      clase_id: classId
    })
      .sort({ fecha: -1 })
      .limit(HISTORY_TURNS)
      .select('pregunta respuesta')
      .lean();
    const history = recentInteractions.reverse();

    // Query documents using embeddings from Supabase
    const searchResults = await searchDocuments(classId, question, 5);

    // Mapear documentId -> nombre real del archivo, para que el bot pueda citar fuentes
    const documentNameById = new Map<string, string>(
      (classDoc.documents || []).map((doc: any) => [String(doc._id), doc.name as string])
    );

    const fragments = searchResults.map(r => ({
      content: r.content,
      similarity: r.similarity,
      documentName: documentNameById.get(String(r.documentId)) || 'documento de la clase',
    }));

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Persona especialista derivada del nombre, la descripción y el material de la clase
    const systemPrompt = buildSystemPrompt({
      className: classDoc.name,
      description: classDoc.description,
      documentNames: (classDoc.documents || []).map((doc: any) => doc.name),
      fragments,
    });

    const historyMessages = history.flatMap((interaction: any) => [
      { role: 'user' as const, content: interaction.pregunta },
      { role: 'assistant' as const, content: interaction.respuesta }
    ]);

    const message = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1600,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...historyMessages,
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