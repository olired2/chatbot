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
<<<<<<< HEAD
          Registro de Estudiante
=======
          Registro en MentorBot
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Completa el formulario para crear tu cuenta
        </p>
      </div>
      <RegisterForm />
    </>
  );
}