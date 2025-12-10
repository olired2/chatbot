import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    // Verificar que la clase existe y pertenece al maestro
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }
    
    if (classDoc.teacher.toString() !== session.user.id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta clase' }, { status: 403 });
    }

    // Parsear el body con manejo de errores
    let body: HandleUploadBody;
    try {
      const text = await req.text();
      body = JSON.parse(text) as HandleUploadBody;
    } catch (parseError) {
      console.error('Error parseando request body:', parseError);
      return NextResponse.json(
        { error: 'Request body inválido' },
        { status: 400 }
      );
    }

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Validar que sea PDF
        if (!pathname.toLowerCase().endsWith('.pdf')) {
          throw new Error('Solo se permiten archivos PDF');
        }
        
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB máximo
          tokenPayload: JSON.stringify({
            classId,
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // El registro del documento se hace desde el cliente
        // después de que el upload termine, llamando a /api/classes/[classId]/documents/register
        console.log(`✅ Upload completado: ${blob.url}`);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error en upload-token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar token' },
      { status: 500 }
    );
  }
}
