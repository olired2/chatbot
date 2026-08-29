import { NextRequest, NextResponse } from 'next/server';
import { PreRegistrationModel } from '@/models/PreRegistration';
import connectDB from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verificar token de seguridad
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN || process.env.CRON_SECRET;
    
    // Solo verificar si hay un token configurado (permite probar en local)
    if (expectedToken && (!authHeader || authHeader !== `Bearer ${expectedToken}`)) {
      console.log('❌ Token de autorización inválido para limpieza automática');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    console.log('🧹 Iniciando limpieza automática de pre-registros...');

    // Contar registros expirados antes de eliminar
    const expiredCount = await PreRegistrationModel.countDocuments({
      expiresAt: { $lt: now }
    });

    // Eliminar registros expirados
    const deleteResult = await PreRegistrationModel.deleteMany({
      expiresAt: { $lt: now }
    });

    // Contar registros activos restantes
    const activeCount = await PreRegistrationModel.countDocuments();

    // Obtener estadísticas de antigüedad de registros activos
    const oldestActive = await PreRegistrationModel.findOne().sort({ createdAt: 1 });
    const newestActive = await PreRegistrationModel.findOne().sort({ createdAt: -1 });

    const stats = {
      timestamp: now.toISOString(),
      expired_deleted: deleteResult.deletedCount,
      expired_found: expiredCount,
      active_remaining: activeCount,
      oldest_active: oldestActive ? oldestActive.createdAt : null,
      newest_active: newestActive ? newestActive.createdAt : null
    };

    console.log('📊 Estadísticas de limpieza:', stats);

    // Log adicional si se eliminaron registros
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️  Eliminados ${deleteResult.deletedCount} pre-registros expirados`);
    } else {
      console.log('✨ No hay registros expirados para eliminar');
    }

    return NextResponse.json({
      success: true,
      message: `Limpieza completada. ${deleteResult.deletedCount} registros eliminados.`,
      stats
    });

  } catch (error) {
    console.error('❌ Error en limpieza automática:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en limpieza automática',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}