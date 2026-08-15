import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validar que sea PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = join(process.cwd(), 'public', 'uploads', classId);
    await mkdir(uploadDir, { recursive: true });
    
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const blobUrl = `/uploads/${classId}/${fileName}`;

    return NextResponse.json({ url: blobUrl });
  } catch (error) {
    console.error('Error en local-upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al subir archivo' },
      { status: 500 }
    );
  }
}
