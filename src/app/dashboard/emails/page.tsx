import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import MotivationalEmailManager from '@/components/MotivationalEmailManager';

export default async function EmailManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'Maestro') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Correos Motivacionales</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra el sistema de correos automáticos para estudiantes inactivos
        </p>
      </div>

      <MotivationalEmailManager />
    </div>
  );
}