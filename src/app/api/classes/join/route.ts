import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import { UserModel } from '@/models/User';
import connectDB from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Estudiante') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { classCode } = await req.json();
    
    if (!classCode) {
      return NextResponse.json({ error: 'Código de clase requerido' }, { status: 400 });
    }

    await connectDB();

    // Buscar la clase por código
    const classToJoin = await ClassModel.findOne({ code: classCode.toUpperCase() });
    
    if (!classToJoin) {
      return NextResponse.json({ error: 'Código de clase no válido' }, { status: 404 });
    }

    // Verificar si la clase no ha expirado
    if (classToJoin.expiresAt && new Date() > classToJoin.expiresAt) {
      return NextResponse.json({ error: 'Esta clase ha expirado' }, { status: 400 });
    }

    // Verificar si el estudiante ya está inscrito
    if (classToJoin.students.includes(session.user.id)) {
      return NextResponse.json({ error: 'Ya estás inscrito en esta clase' }, { status: 400 });
    }

    // Agregar estudiante a la clase
    await ClassModel.findByIdAndUpdate(classToJoin._id, {
      $push: { students: session.user.id }
    });

    // Agregar clase al usuario
    await UserModel.findByIdAndUpdate(session.user.id, {
      $push: { classes: classToJoin._id }
    });

    return NextResponse.json({
      success: true,
      message: 'Te has unido exitosamente a la clase',
      className: classToJoin.name,
      classId: classToJoin._id
    });
  } catch (error) {
    console.error('Error joining class:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      error: 'Error al unirse a la clase', 
      details: errorMessage 
    }, { status: 500 });
  }
}