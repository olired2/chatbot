'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

const INACTIVE_TIME_LIMIT = 30 * 60 * 1000; // 30 minutos de inactividad

export function useAutoLogout() {
  const { data: session } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (session) {
      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ Auto-logout por inactividad');
        signOut({ callbackUrl: '/auth/login' });
      }, INACTIVE_TIME_LIMIT);
    }
  };

  useEffect(() => {
    if (!session) return;

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimeoutHandler = () => resetTimeout();

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimeoutHandler, true);
    });

    // Inicializar timeout
    resetTimeout();

    return () => {
      // Limpiar event listeners
      events.forEach(event => {
        document.removeEventListener(event, resetTimeoutHandler, true);
      });
      
      // Limpiar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session]);
}