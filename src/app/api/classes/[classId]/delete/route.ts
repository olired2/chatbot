import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Marcar como dinámico
export const dynamic = 'force-dynamic';
import { ClassModel } from '@/models/Class';
import { UserModel } from '@/models/User';
import { InteractionModel } from '@/models/Interaction';
import connectDB from '@/lib/db/mongodb';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'Solo los maestros pueden eliminar clases' }, { status: 403 });
    }

    await connectDB();
    
    // Verificar que la clase existe y pertenece al maestro
    const classDoc = await ClassModel.findOne({
      _id: classId,
      teacher: session.user.id
    });
    
    if (!classDoc) {
      return NextResponse.json({ 
        error: 'Clase no encontrada o no tienes permisos para eliminarla' 
      }, { status: 404 });
    }

    console.log(`🗑️ Iniciando eliminación de clase: ${classDoc.name} (${classId})`);

    // Contar datos que serán eliminados
    const studentsCount = classDoc.students?.length || 0;
    const documentsCount = classDoc.documents?.length || 0;
    const interactionsCount = await InteractionModel.countDocuments({ clase_id: classId });

    // 1. Eliminar todas las interacciones de la clase
    const deletedInteractions = await InteractionModel.deleteMany({ clase_id: classId });
    console.log(`📊 Eliminadas ${deletedInteractions.deletedCount} interacciones`);

    // 2. Remover la clase de los arrays de clases de todos los estudiantes
    if (classDoc.students && classDoc.students.length > 0) {
      const updatedUsers = await UserModel.updateMany(
        { _id: { $in: classDoc.students } },
        { $pull: { classes: classId } }
      );
      console.log(`👥 Actualizado ${updatedUsers.modifiedCount} usuarios (estudiantes)`);
    }

    // 3. Eliminar la clase
    await ClassModel.findByIdAndDelete(classId);
    console.log(`🎓 Clase eliminada: ${classDoc.name}`);

    return NextResponse.json({
      success: true,
      message: `Clase "${classDoc.name}" eliminada exitosamente`,
      deletedData: {
        className: classDoc.name,
        classCode: classDoc.code,
        studentsRemoved: studentsCount,
        documentsRemoved: documentsCount,
        interactionsDeleted: deletedInteractions.deletedCount,
        usersUpdated: classDoc.students?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando clase:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar la clase',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET para obtener información de la clase antes de eliminar
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const classDoc = await ClassModel.findOne({
      _id: classId,
      teacher: session.user.id
    }).populate('students', 'nombre email');
    
    if (!classDoc) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }

    // Obtener estadísticas para mostrar al usuario
    const interactionsCount = await InteractionModel.countDocuments({ clase_id: classId });
    const studentsCount = classDoc.students?.length || 0;
    const documentsCount = classDoc.documents?.length || 0;

    return NextResponse.json({
      success: true,
      classInfo: {
        id: classDoc._id,
        name: classDoc.name,
        description: classDoc.description,
        code: classDoc.code,
        createdAt: classDoc.createdAt,
        studentsCount,
        documentsCount,
        interactionsCount,
        students: classDoc.students || []
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo información de clase:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}