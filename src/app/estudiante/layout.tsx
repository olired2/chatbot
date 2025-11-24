import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  return <StudentDashboardLayout>{children}</StudentDashboardLayout>;
}