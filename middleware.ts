import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Matcher para dashboard y páginas de auth
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/']
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Para todas las páginas, evitar cache agresivamente
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  
  return response;
}