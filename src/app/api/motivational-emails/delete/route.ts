import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import { MotivationalEmailModel } from '@/models/MotivationalEmail';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron IDs válidos' }, { status: 400 });
    }

    await connectDB();

    // Convertir strings a ObjectId
    const objectIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));

    // Eliminar los correos seleccionados
    const result = await MotivationalEmailModel.deleteMany({
      _id: { $in: objectIds }
    });

    return NextResponse.json({ 
      success: true, 
      message: `${result.deletedCount} correos eliminados correctamente` 
    });

  } catch (error) {
    console.error('Error deleting emails:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al eliminar los correos' 
    }, { status: 500 });
  }
}
