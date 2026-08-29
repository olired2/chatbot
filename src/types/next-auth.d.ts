import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    nombre: string;
    role: 'Maestro' | 'Estudiante' | 'Administrador';
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'Maestro' | 'Estudiante' | 'Administrador';
    nombre: string;
  }
}