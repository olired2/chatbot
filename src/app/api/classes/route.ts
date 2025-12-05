import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Marcar como dinámico
export const dynamic = 'force-dynamic';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, description, durationType, duration, specificDate } = await req.json();
    
    if (!name || !description) {
      return NextResponse.json({ error: 'Nombre y descripción son requeridos' }, { status: 400 });
    }

    await connectDB();
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Calcular fecha de expiración
    let expiresAt: Date | undefined;
    
    if (durationType === 'days' && duration) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);
    } else if (durationType === 'specific-date' && specificDate) {
      expiresAt = new Date(specificDate);
      expiresAt.setHours(23, 59, 59, 999); // Final del día
    }
    
    const classData: any = {
      name,
      description,
      code,
      teacher: session.user.id,
      durationType: durationType || 'days',
      duration: durationType === 'days' ? duration : undefined
    };
    
    if (expiresAt) {
      classData.expiresAt = expiresAt;
    }
    
    const newClass = await ClassModel.create(classData);

    return NextResponse.json({
      success: true,
      class: newClass
    });
  } catch (error) {
    console.error('Error creating class:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al crear la clase', details: errorMessage }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('SESSION OBJECT IN GET /api/classes:', JSON.stringify(session, null, 2));
    
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await connectDB();
    
    let classes;
    if (session.user.role === 'Maestro') {
      classes = await ClassModel.find({ teacher: session.user.id })
        .populate('students', 'nombre email');
    } else {
      classes = await ClassModel.find({ students: session.user.id })
        .populate('teacher', 'nombre email');
    }

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al obtener clases', details: errorMessage }, { status: 500 });
  }
}