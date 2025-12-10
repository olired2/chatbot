import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

/**
 * API para registrar un documento después de subirlo a Vercel Blob
 * Esto se llama desde el cliente después de un upload exitoso
 */
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

    const { blobUrl, fileName, fileSize } = await req.json();

    if (!blobUrl || !fileName) {
      return NextResponse.json(
        { error: 'blobUrl y fileName son requeridos' },
        { status: 400 }
      );
    }

    console.log(`📝 Registrando documento: ${fileName} -> ${blobUrl}`);

    // Verificar si el documento ya existe (evitar duplicados)
    const existingDoc = classDoc.documents.find((doc: any) => doc.path === blobUrl);
    if (existingDoc) {
      console.log('⚠️ Documento ya existe, retornando existente');
      return NextResponse.json({
        success: true,
        message: 'Documento ya registrado',
        document: existingDoc
      });
    }

    // Guardar referencia en la base de datos
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      {
        $push: {
          documents: {
            name: fileName,
            path: blobUrl,
            size: fileSize || 0,
            uploadedAt: new Date(),
            embeddings: false,
            processed: false
          }
        }
      },
      { new: true }
    );

    if (!updatedClass) {
      return NextResponse.json(
        { error: 'No se pudo actualizar la clase' },
        { status: 500 }
      );
    }

    const newDocument = updatedClass.documents[updatedClass.documents.length - 1];
    console.log(`✅ Documento registrado: ${newDocument._id}`);

    // Iniciar procesamiento en background
    const internalToken = process.env.CRON_SECRET_TOKEN || 'default-secret';
    const baseUrl = process.env.NEXTAUTH_URL || 'https://chatbot-plum-eta-53.vercel.app';
    const processUrl = `${baseUrl}/api/classes/${classId}/documents/process`;

    console.log(`🔄 Iniciando procesamiento automático...`);

    // Fire and forget - no esperamos la respuesta
    fetch(processUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${internalToken}`,
      },
      body: JSON.stringify({
        documentId: newDocument._id.toString(),
        documentUrl: blobUrl,
      }),
    }).catch(error => {
      console.error('⚠️ Error iniciando procesamiento:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Documento registrado exitosamente',
      document: {
        _id: newDocument._id,
        name: newDocument.name,
        path: newDocument.path,
        uploadedAt: newDocument.uploadedAt
      }
    });
  } catch (error) {
    console.error('❌ Error registrando documento:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al registrar documento' },
      { status: 500 }
    );
  }
}
