import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Redirect to appropriate dashboard based on role
  if (session.user.role === 'Maestro') {
    redirect('/dashboard/classes');
  } else {
    redirect('/dashboard/chat');
  }
}