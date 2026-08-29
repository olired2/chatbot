import { NextResponse } from 'next/server';
import { checkAndSendMotivationalEmails } from '@/lib/email/email-automation';

<<<<<<< HEAD
// Endpoint para ser llamado por servicios de cron externos (ej: Vercel Cron, GitHub Actions)
export async function POST(req: Request) {
  try {
    // Verificar token de autorización para seguridad
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
=======
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Verificar token de autorización para seguridad
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN || process.env.CRON_SECRET;

    // Si hay un token esperado, verificarlo (permite testing local si no hay token configurado en dev)
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🕒 Ejecutando proceso automático de correos motivacionales...');
    
    const result = await checkAndSendMotivationalEmails();
    
    if (result.success) {
      console.log(`✅ Proceso automático completado: ${result.emailsSent} correos enviados de ${result.studentsChecked} estudiantes verificados`);
      
      return NextResponse.json({
        success: true,
        message: 'Proceso automático completado exitosamente',
        studentsChecked: result.studentsChecked,
        emailsSent: result.emailsSent,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Error en proceso automático:', result.error);
      
      return NextResponse.json({
        success: false,
        message: 'Error en proceso automático',
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error crítico en proceso automático:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Error crítico en el servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
<<<<<<< HEAD
}

// GET para verificar salud del endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'motivational-emails-cron',
    timestamp: new Date().toISOString(),
    message: 'Endpoint listo para ejecutar correos motivacionales'
  });
=======
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
}