import RegisterForm from '@/components/auth/RegisterForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Registro de Estudiante
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Completa el formulario para crear tu cuenta
        </p>
      </div>
      <RegisterForm />
    </>
  );
}