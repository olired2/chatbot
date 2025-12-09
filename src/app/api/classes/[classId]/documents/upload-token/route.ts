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

    const body = await req.json() as HandleUploadBody;

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
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB máximo
          tokenPayload: JSON.stringify({
            classId,
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Guardar referencia en la base de datos
        const payload = JSON.parse(tokenPayload || '{}');
        
        console.log(`✅ Archivo subido a Blob: ${blob.url}`);
        
        // Extraer nombre del archivo desde la URL
        const fileName = blob.pathname.split('/').pop() || 'documento.pdf';
        
        await ClassModel.findByIdAndUpdate(
          payload.classId,
          {
            $push: {
              documents: {
                name: fileName.replace(/^\d+_/, ''), // Quitar timestamp del nombre
                path: blob.url,
                size: 0, // El tamaño se obtendrá después si es necesario
                uploadedAt: new Date(),
                embeddings: false,
                processed: false
              }
            }
          }
        );
        
        console.log(`📝 Documento registrado en clase ${payload.classId}`);
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
