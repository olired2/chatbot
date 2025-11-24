import LoginForm from '@/components/auth/LoginForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido
        </h1>
        <p className="text-gray-500 text-sm">
          Accede a tu chatbot con tu cuenta
        </p>
      </div>
      <LoginForm />
    </>
  );
}