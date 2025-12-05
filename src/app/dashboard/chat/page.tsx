import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import { ClassModel } from '@/models/Class';
import Chatbot from '@/components/Chatbot';
import { authOptions } from '@/lib/auth';

interface DocumentData {
  name?: string;
  uploadedAt?: Date;
}

interface TeacherData {
  nombre?: string;
  email?: string;
}

interface ClassData {
  _id: unknown;
  name?: string;
  description?: string;
  code?: string;
  documents?: DocumentData[];
  teacher?: TeacherData;
}

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Si es maestro, redirigir a dashboard de clases
  if (session.user.role === 'Maestro') {
    redirect('/dashboard/classes');
  }

  await connectDB();

  // Get the student's classes
  const classes = await ClassModel.find({
    students: session.user.id
  }).populate('teacher', 'nombre email').lean();

  // Serializar las clases para pasarlas al componente cliente
  const serializedClasses = classes.map((cls: ClassData) => ({
    _id: String(cls._id),
    name: cls.name || '',
    description: cls.description || '',
    code: cls.code || '',
    documents: (cls.documents || []).map((doc: DocumentData) => ({
      name: doc.name || '',
      uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : null
    })),
    teacher: {
      nombre: cls.teacher?.nombre || '',
      email: cls.teacher?.email || ''
    }
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat con Mentor IA</h1>
        <p className="text-sm text-gray-600 mb-6">
          Haz preguntas sobre el contenido de tus clases y obtén respuestas basadas en los documentos compartidos por tu profesor.
        </p>
        {serializedClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">No estás inscrito en ninguna clase</h3>
            <p className="mt-1 text-sm text-gray-500">
              Pide a tu profesor el código de la clase para comenzar.
            </p>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>💡 Consejo:</strong> Registrate con el código de clase que te proporcionó tu profesor, 
                o contacta a tu profesor para obtener uno.
              </p>
            </div>
          </div>
        ) : (
          <Chatbot classes={serializedClasses} />
        )}
      </div>
    </div>
  );
}