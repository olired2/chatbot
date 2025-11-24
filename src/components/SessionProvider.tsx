'use client';

import { SessionProvider as Provider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      // Refetch session cada 0 = solo en navegación, no automático
      refetchInterval={0}
      // Refetch cuando la ventana reciba foco
      refetchOnWindowFocus={false}
    >
      {children}
    </Provider>
  );
}