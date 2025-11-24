'use client';

import { useState } from 'react';

interface ClassInfo {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  studentsCount: number;
  documentsCount: number;
  interactionsCount: number;
  students: Array<{
    _id: string;
    nombre: string;
    email: string;
  }>;
}

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo | null;
  onDelete: (classId: string) => void;
}

export default function DeleteClassModal({ 
  isOpen, 
  onClose, 
  classInfo, 
  onDelete 
}: DeleteClassModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !classInfo) return null;

  const handleDelete = async () => {
    if (confirmText !== classInfo.name) {
      alert('El nombre de la clase no coincide. Por favor verifica e intenta nuevamente.');
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(classInfo.id);
      onClose();
    } catch (error) {
      console.error('Error eliminando clase:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText === classInfo.name;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 min-h-min">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Eliminar Clase</h2>
              <p className="text-gray-600 text-xs sm:text-sm">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información básica */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
            <h3 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">Clase a eliminar:</h3>
            <div className="space-y-1 text-xs sm:text-sm">
              <p><strong>Nombre:</strong> {classInfo.name}</p>
              <p><strong>Código:</strong> {classInfo.code}</p>
              <p><strong>Descripción:</strong> {classInfo.description}</p>
              <p><strong>Creada:</strong> {new Date(classInfo.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Estadísticas de datos que serán eliminados */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
            <h3 className="font-semibold text-yellow-800 mb-3 text-sm sm:text-base">📊 Datos que serán eliminados:</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-700">{classInfo.studentsCount}</div>
                <div className="text-yellow-600 text-xs sm:text-sm">Estudiantes</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-700">{classInfo.documentsCount}</div>
                <div className="text-yellow-600 text-xs sm:text-sm">Documentos</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-700">{classInfo.interactionsCount}</div>
                <div className="text-yellow-600 text-xs sm:text-sm">Interacciones</div>
              </div>
            </div>
          </div>

          {/* Lista de estudiantes */}
          {classInfo.studentsCount > 0 && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full p-2 sm:p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium text-blue-800 text-xs sm:text-sm">
                  👥 Estudiantes afectados ({classInfo.studentsCount})
                </span>
                <span className="text-blue-600 text-sm sm:text-base">
                  {showDetails ? '▼' : '▶'}
                </span>
              </button>
              
              {showDetails && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3 sm:p-4 max-h-32 sm:max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {classInfo.students.map(student => (
                      <div key={student._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
                        <span className="font-medium">{student.nombre}</span>
                        <span className="text-gray-500 text-xs">{student.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirmación */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Confirmación requerida:</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              Para confirmar la eliminación, escribe exactamente el nombre de la clase:
            </p>
            <p className="font-mono text-xs sm:text-sm bg-white p-2 rounded border mb-2 sm:mb-3 break-words">
              {classInfo.name}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe el nombre de la clase aquí"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isDeleting}
            />
            {confirmText && !isConfirmValid && (
              <p className="text-red-600 text-xs mt-1">El nombre no coincide</p>
            )}
          </div>

          {/* Advertencia final */}
          <div className="bg-red-100 border border-red-300 rounded-xl p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <span className="text-red-600 text-lg sm:text-xl">🚨</span>
              <div className="text-xs sm:text-sm text-red-800">
                <p className="font-semibold mb-1">¡ATENCIÓN!</p>
                <ul className="space-y-1 text-xs">
                  <li>• Se eliminarán TODOS los datos de la clase permanentemente</li>
                  <li>• Los estudiantes perderán acceso a todo el historial de chat</li>
                  <li>• Los documentos subidos se eliminarán del sistema</li>
                  <li>• Las interacciones y analytics se borrarán completamente</li>
                  <li>• Esta acción NO se puede deshacer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || !isConfirmValid}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            {isDeleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isDeleting ? 'Eliminando...' : 'Eliminar Clase'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}