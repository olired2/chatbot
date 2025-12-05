'use client';

import { SessionProvider as Provider, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Marcar cuando la sesión se abre en sessionStorage
    const markSessionOpen = () => {
      sessionStorage.setItem('session-started', 'true');
    };

    // Detectar cuando todas las pestañas se cierran
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Guardar marca de que se ocultó
        sessionStorage.setItem('was-hidden', 'true');
      }
    };

    // Detectar cuando la pestaña vuelve a ser visible
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // La página fue restaurada del bfcache (back/forward cache)
        // Esto significa que fue navegación de historial, no recarga normal
        const wasHidden = sessionStorage.getItem('was-hidden');
        if (wasHidden) {
          sessionStorage.removeItem('was-hidden');
          // Cerrar sesión completamente
          signOut({ callbackUrl: '/auth/login' });
          return;
        }
      }

      // Si sessionStorage está vacío, significa que se cerró el navegador
      const sessionStarted = sessionStorage.getItem('session-started');
      if (!sessionStarted) {
        // El navegador fue cerrado (sessionStorage se limpió)
        // Redirigir al login
        window.location.href = '/auth/login';
      }
    };

    markSessionOpen();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow as EventListener);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow as EventListener);
    };
  }, []);

  return (
    <Provider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </Provider>
  );
}