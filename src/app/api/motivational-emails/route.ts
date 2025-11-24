import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { checkAndSendMotivationalEmails, getMotivationalEmailStats } from '@/lib/email/email-automation';

// GET: Obtener estadísticas de correos motivacionales
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const classId = url.searchParams.get('classId');

    const stats = await getMotivationalEmailStats(classId || undefined);
    
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error obteniendo estadísticas de correos:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}

// POST: Ejecutar proceso de correos motivacionales manualmente
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log(`🎯 Proceso manual iniciado por: ${session.user.name} (${session.user.email})`);
    
    const result = await checkAndSendMotivationalEmails();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Proceso completado exitosamente. ${result.emailsSent} correos enviados de ${result.studentsChecked} estudiantes verificados.`,
        studentsChecked: result.studentsChecked,
        emailsSent: result.emailsSent
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error en el proceso de correos motivacionales',
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error ejecutando proceso de correos:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}