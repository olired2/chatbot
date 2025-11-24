'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SessionCleanup() {
  const { data: session } = useSession();

  useEffect(() => {
    // Solo marcar el inicio de sesión, sin verificaciones agresivas
    if (session) {
      const sessionStart = sessionStorage.getItem('app-session-start');
      if (!sessionStart) {
        sessionStorage.setItem('app-session-start', Date.now().toString());
      }
    }

    // Función simple para limpiar al cerrar navegador
    const handleBeforeUnload = () => {
      // Solo limpiar localStorage, no forzar signout
      localStorage.clear();
      // Mantener sessionStorage para detectar cierre de navegador vs recarga
    };

    // Solo limpiar al cerrar navegador/pestaña
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  return null;
}