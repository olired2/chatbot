'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreateClassModal from '@/components/CreateClassModal';
import DeleteClassModal from '@/components/DeleteClassModal';

interface ClassItemProps {
  _id: string;
  name: string;
  description: string;
  code: string;
  students: string[];
  documents: {
    filename: string;
    uploadedAt: string | null;
  }[];
}

interface ClassesClientProps {
  initialClasses: ClassItemProps[];
}

export default function ClassesClient({ initialClasses }: ClassesClientProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);

  const handleClassCreated = async () => {
    // Recargar las clases
    const response = await fetch('/api/classes');
    const data = await response.json();
    if (data.success) {
      setClasses(data.classes);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent, classItem: ClassItemProps) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Obtener información detallada de la clase para el modal
      const response = await fetch(`/api/classes/${classItem._id}/delete`);
      const data = await response.json();
      
      if (data.success) {
        setClassToDelete({
          id: classItem._id,
          name: classItem.name,
          description: classItem.description,
          code: classItem.code,
          createdAt: new Date().toISOString(), // Podríamos agregarlo al modelo después
          ...data.classInfo
        });
        setIsDeleteModalOpen(true);
      } else {
        alert('Error al cargar información de la clase');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar información de la clase');
    }
  };

  const handleDeleteConfirm = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/delete`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de clases
        setClasses(classes.filter(c => c._id !== classId));
        setIsDeleteModalOpen(false);
        setClassToDelete(null);
        alert(`Clase eliminada exitosamente. ${data.message}`);
      } else {
        alert(data.error || 'Error al eliminar la clase');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la clase');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 text-visible">📚 Mis Clases</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
          >
            ➕ Nueva Clase
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 text-visible mb-2">No tienes clases creadas</h3>
            <p className="text-gray-600 text-secondary mb-6 max-w-sm mx-auto">
              Crea tu primera clase para comenzar a interactuar con estudiantes y MentorBot
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              ➕ Crear Mi Primera Clase
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <div
                key={classItem._id}
                className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-indigo-300 relative group"
              >
                {/* Botón de eliminar */}
                <button
                  onClick={(e) => handleDeleteClick(e, classItem)}
                  className="absolute top-3 right-3 z-10 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Eliminar clase"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <Link href={`/dashboard/classes/${classItem._id}`}>
                  <div className="px-6 py-6">
                    <h3 className="text-xl font-bold text-gray-900 text-visible mb-2 pr-8">{classItem.name}</h3>
                    <p className="text-gray-600 text-secondary text-sm line-clamp-2 mb-4">
                      {classItem.description}
                    </p>
                    <div className="bg-gray-50 px-3 py-2 rounded-md mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Código:</span>{' '}
                        <span className="font-mono font-bold text-indigo-600">{classItem.code}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-gray-600">
                          👥 <span className="font-medium">{classItem.students?.length || 0}</span> estudiantes
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          📄 <span className="font-medium">{classItem.documents?.length || 0}</span> documentos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border-t border-indigo-100 px-6 py-4">
                    <span className="text-indigo-700 hover:text-indigo-900 font-semibold text-sm flex items-center justify-between">
                      Ver detalles de la clase
                      <span className="text-indigo-500">→</span>
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleClassCreated}
      />

      <DeleteClassModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClassToDelete(null);
        }}
        classInfo={classToDelete}
        onDelete={handleDeleteConfirm}
      />
    </>
  );
}
