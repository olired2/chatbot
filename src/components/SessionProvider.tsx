'use client';

import { SessionProvider as Provider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </Provider>
  );
}