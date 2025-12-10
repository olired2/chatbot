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
        try {
          // Asegurar conexión a DB
          await connectDB();
          
          // Guardar referencia en la base de datos
          const payload = JSON.parse(tokenPayload || '{}');
          
          console.log(`✅ Archivo subido a Blob: ${blob.url}`);
          
          // Extraer nombre del archivo desde la URL
          const fileName = blob.pathname.split('/').pop() || 'documento.pdf';
          const cleanFileName = fileName.replace(/^\d+_/, ''); // Quitar timestamp del nombre
          
          console.log(`📝 Guardando documento en MongoDB: ${cleanFileName}`);
          
          const updatedClass = await ClassModel.findByIdAndUpdate(
            payload.classId,
            {
              $push: {
                documents: {
                  name: cleanFileName,
                  path: blob.url,
                  size: 0,
                  uploadedAt: new Date(),
                  embeddings: false,
                  processed: false
                }
              }
            },
            { new: true }
          );
          
          if (!updatedClass) {
            console.error('❌ No se pudo actualizar la clase');
            return;
          }
          
          console.log(`✅ Documento registrado en clase ${payload.classId}`);
          
          // Iniciar procesamiento en background
          const lastDocument = updatedClass.documents[updatedClass.documents.length - 1];
          const internalToken = process.env.CRON_SECRET_TOKEN || 'default-secret';
          
          // Obtener la URL base del request actual
          const baseUrl = process.env.NEXTAUTH_URL || 'https://chatbot-plum-eta-53.vercel.app';
          const processUrl = `${baseUrl}/api/classes/${payload.classId}/documents/process`;
          
          console.log(`🔄 Iniciando procesamiento automático: ${processUrl}`);
          
          // Fire and forget - no esperamos la respuesta
          fetch(processUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${internalToken}`,
            },
            body: JSON.stringify({
              documentId: lastDocument._id.toString(),
              documentUrl: blob.url,
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
        } catch (error) {
          console.error('❌ Error en onUploadCompleted:', error);
        }
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
