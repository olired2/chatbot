import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API para debugging de sesiones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const debugInfo = {
      hasSession: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      redirectionRules: {
        'Estudiante accessing /dashboard/classes': 'Redirect to /estudiante',
        'Estudiante accessing /dashboard': 'Redirect to /estudiante',
        'Maestro accessing /dashboard/chat': 'Redirect to /dashboard/classes',
        'Maestro accessing /dashboard': 'Allow access'
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}