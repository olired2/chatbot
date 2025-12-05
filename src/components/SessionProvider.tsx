'use client';

import { SessionProvider as Provider, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Detectar cuando el usuario cierra la pestaña o navegador
    const handleBeforeUnload = () => {
      // Marcar en localStorage que se cerró la pestaña
      localStorage.setItem('session-closed', Date.now().toString());
    };

    // Detectar cuando se abre/recarga la página
    const handleLoad = () => {
      const sessionClosed = localStorage.getItem('session-closed');
      if (sessionClosed) {
        // Si existe la marca, significa que se cerró previamente
        const timeSinceClosed = Date.now() - parseInt(sessionClosed);
        // Si pasaron más de 1 segundo, consideramos que se cerró el navegador
        if (timeSinceClosed > 1000) {
          localStorage.removeItem('session-closed');
          signOut({ redirect: false });
        } else {
          // Fue solo un refresh, no cerrar sesión
          localStorage.removeItem('session-closed');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    handleLoad();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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