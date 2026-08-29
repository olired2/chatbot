import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';
import { deleteDocumentEmbeddings } from '@/lib/ai/mongodb-embeddings';
import { saveDocument, deleteDocument } from '@/lib/storage/documents';

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

    const documentUrl = await saveDocument(classId, file.name, buffer);

    console.log(`Archivo subido: ${documentUrl}`);

    // Actualizar documento de la clase
    const updatedClass = await ClassModel.findByIdAndUpdate(
      classId,
      {
        $push: {
          documents: {
            name: file.name,
            path: documentUrl,
            size: file.size,
            uploadedAt: new Date(),
            embeddings: false,
            processed: false
          }
        }
      },
      { new: true }
    );

    // Procesar embeddings automáticamente en background (sin esperar respuesta)
    console.log(`🔄 Iniciando procesamiento de embeddings para: ${file.name}`);
    
    // Ejecutar en background sin bloquear la respuesta
    const internalToken = process.env.CRON_SECRET_TOKEN || 'default-secret';
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const processUrl = `${baseUrl}/api/classes/${classId}/documents/process`;
    
    console.log(`📡 Llamando a: ${processUrl}`);
    
    // Iniciar el procesamiento sin esperar (fire and forget)
    fetch(processUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${internalToken}`,
      },
      body: JSON.stringify({
        documentId: updatedClass.documents[updatedClass.documents.length - 1]._id,
        documentUrl,
      }),
    }).then(response => {
      if (response.ok) {
        console.log('✅ Procesamiento iniciado exitosamente');
      } else {
        response.text().then(text => {
          console.error('⚠️ Error iniciando procesamiento:', text);
        });
      }
    }).catch(error => {
      console.error('⚠️ Error en procesamiento background:', error);
    });

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

    // Eliminar archivo del almacenamiento (Blob o disco local) si existe
    try {
      if (docToDelete.path) {
        await deleteDocument(docToDelete.path);
        console.log(`✅ Archivo eliminado: ${docToDelete.path}`);
      }
    } catch (fileError) {
      console.error('Error eliminando archivo:', fileError);
      // Continuar aunque falle la eliminación del archivo
    }

    // Eliminar embeddings de la base de datos (los chunks se guardan con el
    // _id del documento como documentId, no con su path — ver process/route.ts)
    try {
      await deleteDocumentEmbeddings(classId, String(docToDelete._id));
    } catch (embedError) {
      console.error('Error eliminando embeddings de la BD:', embedError);
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