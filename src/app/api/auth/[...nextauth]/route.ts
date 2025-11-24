import NextAuth, { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from '@/lib/db/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { UserModel } from '@/models/User';
import connectDB from '@/lib/db/mongodb';
import { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        
        const user = await UserModel.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.rol,
          name: user.nombre,
          nombre: user.nombre
        };
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // cambiar a true en producción con HTTPS
        // Sin maxAge para que sea cookie de sesión del navegador
      }
    }
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.nombre = user.nombre;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: JWT }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.nombre = token.nombre;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };