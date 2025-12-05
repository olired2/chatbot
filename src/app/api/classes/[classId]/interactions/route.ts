import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClassModel } from '@/models/Class';
import { InteractionModel } from '@/models/Interaction';
import { UserModel } from '@/models/User';
import connectDB from '@/lib/db/mongodb';

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
    
    // Verificar que el usuario sea el profesor de la clase
    const classDoc = await ClassModel.findOne({
      _id: classId,
      teacher: session.user.id  // Cambiar de createdBy a teacher
    });
    
    if (!classDoc) {
      return NextResponse.json({ error: 'Clase no encontrada o no tienes permisos' }, { status: 404 });
    }

    // Obtener todas las interacciones de la clase con información de usuario
    const interactions = await InteractionModel.find({
      clase_id: classId
    }).sort({ fecha: 1 }); // Ordenar por fecha ascendente

    // Obtener información adicional de usuarios
    const allUserIds = interactions.map(i => i.usuario_id?.toString()).filter(Boolean);
    const userIds = [...new Set(allUserIds)];
    
    // Filtrar solo usuarios que son estudiantes de esta clase
    const classStudentIds = classDoc.students?.map((s: any) => s.toString()) || [];
    const activeUserIds = userIds.filter(userId => {
      return userId && classStudentIds.includes(userId);
    });
    
    const users = await UserModel.find({
      _id: { $in: userIds }
    }).select('_id nombre email');

    const usersMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = {
        name: user.nombre,
        email: user.email
      };
      return acc;
    }, {} as Record<string, { name: string; email: string }>);

    // Enriquecer interacciones con datos de usuario
    const enrichedInteractions = interactions.map(interaction => ({
      _id: interaction._id,
      pregunta: interaction.pregunta,
      respuesta: interaction.respuesta,
      fecha: interaction.fecha,
      usuario_id: interaction.usuario_id,
      usuario_nombre: usersMap[interaction.usuario_id?.toString()]?.name || 'Usuario desconocido',
      usuario_email: usersMap[interaction.usuario_id?.toString()]?.email || ''
    }));

    // Calcular diferentes métricas de usuarios
    const totalStudentsInClass = classStudentIds.length;
    const studentsWithInteractions = activeUserIds.length;
    
    // Debug info (temporal)
    console.log('=== DEBUG STATS ===');
    console.log('Total interactions:', interactions.length);
    console.log('Total students in class:', totalStudentsInClass);
    console.log('Unique users with interactions (all):', userIds.length);
    console.log('Students with interactions (filtered):', studentsWithInteractions);
    console.log('Class student IDs:', classStudentIds);
    console.log('Unique user IDs (all):', userIds);
    console.log('Active user IDs (filtered):', activeUserIds);
    
    // Calcular estadísticas corregidas
    const stats = {
      totalInteractions: interactions.length,
      uniqueUsers: studentsWithInteractions, // Estudiantes que han interactuado
      totalStudents: totalStudentsInClass, // Total de estudiantes en la clase
      dateRange: {
        start: interactions.length > 0 ? interactions[0].fecha : null,
        end: interactions.length > 0 ? interactions[interactions.length - 1].fecha : null
      },
      // Interacciones por día
      interactionsByDate: interactions.reduce((acc, interaction) => {
        const date = new Date(interaction.fecha).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      // Interacciones por usuario
      interactionsByUser: interactions.reduce((acc, interaction) => {
        const userId = interaction.usuario_id?.toString() || 'unknown';
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      // Mapa de nombres de usuarios
      userNames: users.reduce((acc, user) => {
        acc[user._id.toString()] = user.nombre;
        return acc;
      }, {} as Record<string, string>)
    };

    return NextResponse.json({
      success: true,
      interactions: enrichedInteractions,
      stats,
      class: {
        name: classDoc.name,
        description: classDoc.description,
        studentsCount: classDoc.students?.length || 0
      }
    });

  } catch (error) {
    console.error('Error obteniendo interacciones:', error);
    return NextResponse.json({ 
      error: 'Error al obtener las interacciones',
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}