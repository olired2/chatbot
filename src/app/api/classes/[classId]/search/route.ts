import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { searchDocuments } from '@/lib/ai/supabase-embeddings';
=======
import { searchDocuments } from '@/lib/ai/mongodb-embeddings';
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { classId, query, limit = 5 } = await req.json();

    if (!classId || !query) {
      return NextResponse.json(
        { error: 'classId y query son requeridos' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando documentos para: "${query}"`);

    const results = await searchDocuments(classId, query, limit);

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('❌ Error en búsqueda semántica:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        error: 'Error al buscar documentos',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
