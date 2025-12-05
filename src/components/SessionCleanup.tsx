'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SessionCleanup() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    // Marcar inicio de sesión
    const sessionStart = sessionStorage.getItem('app-session-start');
    if (!sessionStart) {
      sessionStorage.setItem('app-session-start', Date.now().toString());
      console.log('🚀 Nueva sesión iniciada');
    }

    // Manejar visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página se oculta - almacenar timestamp
        sessionStorage.setItem('app-last-hidden', Date.now().toString());
        console.log('👁️ Página oculta');
      } else {
        // Página se muestra - verificar si ha pasado mucho tiempo
        const lastHidden = sessionStorage.getItem('app-last-hidden');
        if (lastHidden) {
          const timeDiff = Date.now() - parseInt(lastHidden);
          const maxInactiveTime = 30 * 60 * 1000; // 30 minutos
          
          if (timeDiff > maxInactiveTime) {
            console.log('⏱️ Sesión expirada por inactividad prolongada');
            signOut({ callbackUrl: '/auth/login' });
          } else {
            console.log('👁️ Página visible nuevamente');
          }
          sessionStorage.removeItem('app-last-hidden');
        }
      }
    };

    // Limpiar datos al cerrar navegador
    const handleBeforeUnload = () => {
      // Marcar que el navegador se está cerrando
      sessionStorage.setItem('app-closing', 'true');
      localStorage.clear();
    };

    // Detectar si el navegador fue cerrado completamente
    const handleLoad = () => {
      const wasClosing = sessionStorage.getItem('app-closing');
      if (wasClosing === 'true') {
        // El navegador fue cerrado y reabierto - limpiar sesión
        console.log('🔄 Navegador fue cerrado y reabierto - cerrando sesión');
        sessionStorage.clear();
        signOut({ callbackUrl: '/auth/login' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, [session]);

  return null;
}