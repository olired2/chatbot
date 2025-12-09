import LoginForm from '@/components/auth/LoginForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="relative">
      {/* Nota flotante con flecha */}
      <div className="absolute -right-64 top-8 hidden lg:flex items-center">
        <svg 
          className="w-12 h-12 text-indigo-500 transform -scale-x-100" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        <div className="ml-2 p-4 bg-white border-2 border-indigo-500 rounded-lg shadow-lg max-w-[200px]">
          <p className="text-sm font-semibold text-indigo-700 text-center">
            Acceda al Agente Educativo desde su cuenta
          </p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido
        </h1>
        <p className="text-gray-500 text-sm">
          Accede a tu chatbot con tu cuenta
        </p>
      </div>
      <LoginForm />
    </div>
  );
}