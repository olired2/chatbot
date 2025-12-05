import DashboardLayout from '@/components/layouts/DashboardLayout';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  // Redirigir estudiantes a su dashboard específico
  if (session.user.role === 'Estudiante') {
    redirect('/estudiante');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}