import { NextResponse } from 'next/server';
import { searchDocuments } from '@/lib/ai/supabase-embeddings';

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
