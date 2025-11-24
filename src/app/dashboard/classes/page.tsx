import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import { ClassModel } from '@/models/Class';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ClassesClient from '@/components/ClassesClient';

export default async function ClassesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Si es estudiante, redirigir a chat
  if (session.user.role === 'Estudiante') {
    redirect('/dashboard/chat');
  }

  await connectDB();
  const classes = await ClassModel.find({ teacher: session.user.id }).sort({ createdAt: -1 });

  // Serializar los datos para pasarlos al componente cliente
  const serializedClasses = classes.map(cls => ({
    _id: cls._id.toString(),
    name: cls.name,
    description: cls.description,
    code: cls.code,
    students: (cls.students || []).map((s: any) => (typeof s === 'string' ? s : s.toString())),
    documents: (cls.documents || []).map((doc: any) => ({
      filename: doc.filename,
      uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : null
    }))
  }));

  return <ClassesClient initialClasses={serializedClasses} />;
}