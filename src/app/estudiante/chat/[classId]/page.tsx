import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ClassModel } from '@/models/Class';
import connectDB from '@/lib/db/mongodb';
import SingleClassChatbot from '@/components/SingleClassChatbot';

interface ChatPageProps {
  params: Promise<{ classId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'Estudiante') {
    redirect('/dashboard');
  }

  // Verificar que el estudiante esté inscrito en esta clase
  await connectDB();
  const classData = await ClassModel.findById(classId);
  
  if (!classData) {
    redirect('/estudiante');
  }

  // Verificar que el estudiante esté inscrito
  if (!classData.students.includes(session.user.id)) {
    redirect('/estudiante');
  }

  // Verificar que la clase no haya expirado
  if (classData.expiresAt && new Date() > classData.expiresAt) {
    redirect('/estudiante');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
            <p className="text-gray-600">Mentor de IA especializado en esta clase</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos para chatear:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Haz preguntas específicas sobre el material de la clase</li>
            <li>• El mentor conoce todos los documentos subidos por tu profesor</li>
            <li>• Puedes pedir explicaciones, ejemplos o ejercicios</li>
            <li>• También puedes solicitar motivación o consejos de estudio</li>
          </ul>
        </div>
      </div>

      <SingleClassChatbot classId={classId} />
    </div>
  );
}