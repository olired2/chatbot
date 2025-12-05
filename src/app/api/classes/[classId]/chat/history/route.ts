import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import { InteractionModel } from '@/models/Interaction';
import { UserModel } from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { classId } = await params;

    await connectDB();

    // Obtener el ID del usuario
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todas las interacciones del usuario en esta clase, ordenadas por fecha
    const interactions = await InteractionModel.find({
      usuario_id: user._id,
      clase_id: classId
    })
    .sort({ fecha: 1 }) // Orden cronológico
    .select('pregunta respuesta fecha')
    .lean();

    return NextResponse.json({
      success: true,
      interactions: interactions.map(interaction => ({
        question: interaction.pregunta,
        answer: interaction.respuesta,
        timestamp: interaction.fecha
      }))
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
