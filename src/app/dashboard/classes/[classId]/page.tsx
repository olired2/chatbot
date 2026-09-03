import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import { ClassModel } from '@/models/Class';
import { InteractionModel } from '@/models/Interaction';
import UploadDocument from '@/components/UploadDocument';
import DocumentList from '@/components/DocumentList';
import ReportGenerator from '@/components/ReportGenerator';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

interface DocumentData {
  name?: string;
  uploadedAt?: Date;
  size?: number;
  embeddings?: boolean;
  processed?: boolean;
  path?: string;
  _id?: unknown;
  lastError?: string | null;
  errorCount?: number;
}

interface StudentData {
  _id: unknown;
  nombre?: string;
  email?: string;
}

interface TeacherData {
  _id: unknown;
  nombre?: string;
  email?: string;
}

interface ClassDocument {
  name?: string;
  description?: string;
  code?: string;
  documents?: DocumentData[];
  students?: StudentData[];
  teacher?: TeacherData;
}

interface StudentWithProgress {
  _id: string;
  nombre: string;
  email: string;
  lastInteraction: Date | null;
  lastActive: Date | null;
  totalInteractions: number;
  needsMotivation: boolean;
  isOnline: boolean;
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'Maestro') {
    redirect('/dashboard');
  }

  await connectDB();
  const classDoc = await ClassModel.findById(classId)
    .populate('students', 'nombre email')
    .populate('teacher', 'nombre email')
    .lean();

  if (!classDoc) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900">Clase no encontrada</h3>
      </div>
    );
  }

  const classData = classDoc as ClassDocument;

  // Verificar que el maestro es el dueño de la clase
  if (classData.teacher && String(classData.teacher._id) !== session.user.id) {
    redirect('/dashboard/classes');
  }

  // Serializar documentos
  const serializedDocuments = (classData.documents || []).map((doc: DocumentData) => ({
    name: doc.name || '',
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
    size: doc.size || 0,
    embeddings: doc.embeddings || false,
    processed: doc.processed || false,
    path: doc.path || '',
    _id: doc._id ? String(doc._id) : undefined,
    lastError: doc.lastError || null,
    errorCount: doc.errorCount || 0
  }));

  // Obtener última interacción de cada estudiante
  const studentsWithProgress: StudentWithProgress[] = await Promise.all(
    (classData.students || []).map(async (student: StudentData) => {
      const lastInteraction = await InteractionModel.findOne({
        usuario_id: student._id,
        clase_id: classId
      }).sort({ fecha: -1 });

      const totalInteractions = await InteractionModel.countDocuments({
        usuario_id: student._id,
        clase_id: classId
      });

      const userDoc = await import('@/models/User').then(({ UserModel }) => 
        UserModel.findById(student._id).select('lastActive').lean()
      );
      const lastActive = (userDoc as any)?.lastActive || null;
      
      // Consideramos "Online" si tuvo actividad en los últimos 5 minutos
      const isOnline = lastActive ? (new Date().getTime() - new Date(lastActive).getTime()) < 5 * 60 * 1000 : false;

      return {
        _id: String(student._id),
        nombre: student.nombre || '',
        email: student.email || '',
        lastInteraction: lastInteraction?.fecha || null,
        lastActive,
        totalInteractions,
        needsMotivation: !lastInteraction || 
          (new Date().getTime() - new Date(lastInteraction.fecha).getTime()) > 15 * 24 * 60 * 60 * 1000,
        isOnline
      };
    })
  );

  return (
    <div className="dashboard-content space-y-6" style={{color: '#000000'}}>
      <div className="class-header bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-3xl font-bold mb-2" style={{color: '#000000', fontWeight: 'bold', fontSize: '2rem'}}>{classData.name}</h1>
        <p className="text-base mb-3" style={{color: '#4b5563', fontWeight: '500'}}>{classData.description}</p>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 inline-block">
          <p className="text-sm font-medium" style={{color: '#3730a3'}}>
            📋 Código de clase: <span className="font-mono font-bold" style={{color: '#1e1b4b'}}>{classData.code}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección de subida de documentos */}
        <div>
          <UploadDocument classId={classId} />
        </div>

        {/* Sección de documentos existentes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Documentos Subidos ({serializedDocuments.length})
          </h3>
          
          <DocumentList 
            classId={classId} 
            documents={serializedDocuments} 
          />
        </div>
      </div>

      {/* Dashboard de Analíticas */}
      <div>
        <AnalyticsDashboard classId={classId} />
      </div>

      {/* Generador de Reportes */}
      <div>
        <ReportGenerator classId={classId} className={classData.name || ''} />
      </div>

      {/* Sección de estudiantes con progreso */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📊 Progreso de Estudiantes ({studentsWithProgress.length})
        </h3>
        
        {studentsWithProgress.length > 0 ? (
          <div className="space-y-4">
            {studentsWithProgress.map((student: StudentWithProgress) => (
              <div
                key={student._id}
                className={`border rounded-lg p-4 ${
                  student.needsMotivation ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{student.nombre}</p>
                      {student.isOnline && (
                        <span className="flex items-center text-xs text-green-600 font-medium">
                          <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Conectado ahora
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600">
                        💬 {student.totalInteractions} interacción(es) total con el chatbot
                      </p>
                      
                      {student.lastActive ? (
                        <p className="text-xs text-indigo-600 font-medium">
                          🔌 Última conexión: {new Date(student.lastActive).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">🔌 Nunca se ha conectado</p>
                      )}

                      {student.lastInteraction && (
                        <p className="text-xs text-gray-600">
                          🕒 Última pregunta: {new Date(student.lastInteraction).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2 items-end">
                    {student.needsMotivation && student.totalInteractions > 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                        ⚠️ Necesita motivación (Inactivo &gt; 15 días)
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay estudiantes inscritos</p>
            <p className="text-sm mt-1">Comparte el código de clase con tus estudiantes</p>
          </div>
        )}
      </div>
    </div>
  );
}
