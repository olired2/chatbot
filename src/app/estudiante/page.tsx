import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import StudentDashboard from '@/components/StudentDashboard';

export default async function EstudiantePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'Estudiante') {
    redirect('/dashboard');
  }

  return <StudentDashboard />;
}