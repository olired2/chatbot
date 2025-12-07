import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';
import { put, del } from '@vercel/blob';

// Marcar como dinámico
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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se ha subido ningún archivo' }, { status: 400 });
    }

    // Validar que sea un PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Subir a Vercel Blob Storage
    const fileName = `${Date.now()}_${file.name}`;
    const blobPath = `uploads/${classId}/${fileName}`;
    
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    
    console.log(`Archivo subido a Blob Storage: ${blob.url}`);

    // Actualizar documento de la clase
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      {
        $push: {
          documents: {
            name: file.name,
            path: blob.url,
            size: file.size,
            uploadedAt: new Date(),
            embeddings: false,
            processed: false
          }
        }
      },
      { new: true }
    );

    // Procesar embeddings automáticamente en background
    console.log(`🔄 Iniciando procesamiento de embeddings para: ${file.name}`);
    try {
      const processResponse = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/classes/${classId}/documents/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: updatedClass.documents[updatedClass.documents.length - 1]._id,
            documentUrl: blob.url,
          }),
        }
      );

      if (processResponse.ok) {
        console.log('✅ Procesamiento iniciado exitosamente');
      } else {
        console.error('⚠️ Error iniciando procesamiento:', await processResponse.text());
      }
    } catch (processError) {
      console.error('⚠️ Error en procesamiento background:', processError);
      // No fallar la subida si falla el procesamiento
    }

    return NextResponse.json({
      success: true,
      message: 'Documento subido y procesándose',
      document: {
        name: file.name,
        size: file.size,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      error: 'Error al subir el documento',
      details: errorMessage 
    }, { status: 500 });
  }
}

// GET para obtener los documentos de una clase
export async function GET(
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
    
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      documents: classDoc.documents || []
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      error: 'Error al obtener documentos',
      details: errorMessage 
    }, { status: 500 });
  }
}

// DELETE para eliminar un documento
export async function DELETE(
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
    
    const { documentName } = await req.json();
    
    if (!documentName) {
      return NextResponse.json({ error: 'Nombre de documento requerido' }, { status: 400 });
    }

    // Verificar que la clase existe y pertenece al maestro
    const classDoc = await ClassModel.findById(classId);
    if (!classDoc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }
    
    if (classDoc.teacher.toString() !== session.user.id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta clase' }, { status: 403 });
    }

    // Encontrar el documento
    const docToDelete = classDoc.documents?.find((doc: any) => doc.name === documentName);
    
    if (!docToDelete) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    // Eliminar archivo de Vercel Blob Storage si existe
    try {
      if (docToDelete.path) {
        await del(docToDelete.path);
        console.log(`✅ Archivo eliminado de Blob Storage: ${docToDelete.path}`);
      }
    } catch (fileError) {
      console.error('Error eliminando archivo de Blob Storage:', fileError);
      // Continuar aunque falle la eliminación del archivo
    }

    // Eliminar de la base de datos
    await ClassModel.findByIdAndUpdate(
      classId,
      {
        $pull: {
          documents: { name: documentName }
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      error: 'Error al eliminar documento',
      details: errorMessage 
    }, { status: 500 });
  }
}