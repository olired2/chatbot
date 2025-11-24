'use client';

import { useState } from 'react';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!classCode.trim()) {
      setError('Por favor ingresa un código de clase');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          classCode: classCode.trim().toUpperCase() 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al unirse a la clase');
      }

      // Limpiar formulario
      setClassCode('');
      
      // Mostrar mensaje de éxito
      alert(`¡Te has unido exitosamente a la clase "${data.className}"! 🎉`);
      
      // Llamar callback de éxito
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClassCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎓</span>
            <h3 className="text-lg font-medium text-gray-900">
              Unirse a Clase
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Clase
            </label>
            <input
              type="text"
              id="classCode"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              placeholder="Ej: ABC123"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el código de 6 caracteres que te proporcionó tu profesor
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 text-lg">💡</span>
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">¿Cómo obtener el código?</p>
                <ul className="space-y-1">
                  <li>• Pregúntale a tu profesor por el código de la clase</li>
                  <li>• El código son 6 caracteres (letras y números)</li>
                  <li>• Puedes unirte a múltiples clases con códigos diferentes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !classCode.trim()}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Uniéndose...' : 'Unirse a Clase'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}