import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      MONGODB_URI: !!process.env.MONGODB_URI ? '✅ Configurada' : '❌ Falta',
      GROQ_API_KEY: !!process.env.GROQ_API_KEY ? '✅ Configurada' : '❌ Falta',
      SUPABASE_URL: !!process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Falta',
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Falta',
      JINA_API_KEY: !!process.env.JINA_API_KEY ? '✅ Configurada' : '❌ Falta',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'No configurada (usando URL dinámica)',
      CRON_SECRET_TOKEN: !!process.env.CRON_SECRET_TOKEN ? '✅ Configurada' : '❌ Falta',
    },
    supabaseConfig: {
      url: process.env.SUPABASE_URL || 'No configurada',
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    jinaConfig: {
      hasKey: !!process.env.JINA_API_KEY,
      keyPrefix: process.env.JINA_API_KEY ? process.env.JINA_API_KEY.substring(0, 10) + '...' : 'N/A',
    },
  };

  // Verificar si todas las variables críticas están presentes
  const allPresent = 
    checks.environment.MONGODB_URI === '✅ Configurada' &&
    checks.environment.GROQ_API_KEY === '✅ Configurada' &&
    checks.environment.SUPABASE_URL === '✅ Configurada' &&
    checks.environment.SUPABASE_SERVICE_ROLE_KEY === '✅ Configurada' &&
    checks.environment.JINA_API_KEY === '✅ Configurada';

  return NextResponse.json({
    status: allPresent ? 'healthy' : 'missing_vars',
    message: allPresent 
      ? '✅ Todas las variables de entorno están configuradas'
      : '⚠️ Faltan algunas variables de entorno críticas',
    checks,
  });
}
