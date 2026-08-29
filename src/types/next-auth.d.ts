import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    nombre: string;
<<<<<<< HEAD
    role: 'Maestro' | 'Estudiante';
=======
    role: 'Maestro' | 'Estudiante' | 'Administrador';
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
<<<<<<< HEAD
    role: 'Maestro' | 'Estudiante';
=======
    role: 'Maestro' | 'Estudiante' | 'Administrador';
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
    nombre: string;
  }
}