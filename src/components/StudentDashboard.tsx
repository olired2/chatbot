'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import JoinClassModal from '@/components/JoinClassModal';

interface ClassItem {
  _id: string;
  name: string;
  description: string;
  code: string;
  teacher: {
    nombre: string;
    email: string;
  };
  expiresAt?: string;
  documents: any[];
  createdAt: string;
}

export default function StudentDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSuccess = () => {
    fetchClasses(); // Recargar clases después de unirse
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirada';
    if (diffDays === 0) return 'Expira hoy';
    if (diffDays === 1) return '1 día restante';
    return `${diffDays} días restantes`;
  };

  const getExpirationColor = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 bg-red-50';
    if (diffDays <= 7) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎓 Mis Clases</h1>
            <p className="text-gray-600 mt-1">Accede a tus clases y conversa con MentorBot</p>
          </div>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
          >
            ➕ Unirse a Clase
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-6xl mb-4">🎒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No estás inscrito en ninguna clase</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Únete a una clase usando el código que te proporcionó tu profesor para comenzar a conversar con MentorBot
            </p>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              ➕ Unirse a Mi Primera Clase
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <div
                key={classItem._id}
                className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                <div className="px-6 py-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                    {classItem.expiresAt && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpirationColor(classItem.expiresAt)}`}>
                        ⏰ {getTimeRemaining(classItem.expiresAt)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {classItem.description}
                  </p>
                  
                  <div className="bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Profesor:</span>{' '}
                      <span className="text-indigo-600">{classItem.teacher.nombre}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Código: <span className="font-mono font-bold">{classItem.code}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-gray-600">
                        📄 <span className="font-medium">{classItem.documents?.length || 0}</span> recursos
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(classItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100 px-6 py-4">
                  <Link
                    href={`/estudiante/chat/${classItem._id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🤖</span>
                        <span className="text-indigo-700 font-semibold text-sm">
                          Chatear con Mentor IA
                        </span>
                      </div>
                      <span className="text-indigo-500 text-xl">→</span>
                    </div>
                    <p className="text-xs text-indigo-600 mt-1 ml-8">
                      Pregunta sobre el material de la clase
                    </p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <JoinClassModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={handleJoinSuccess}
      />
    </>
  );
}