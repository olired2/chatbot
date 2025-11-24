'use client';

import { useState } from 'react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationType, setDurationType] = useState<'days' | 'specific-date'>('days');
  const [duration, setDuration] = useState(30);
  const [specificDate, setSpecificDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          description, 
          durationType,
          duration: durationType === 'days' ? duration : undefined,
          specificDate: durationType === 'specific-date' ? specificDate : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la clase');
      }

      // Limpiar formulario
      setName('');
      setDescription('');
      setDurationType('days');
      setDuration(30);
      setSpecificDate('');
      
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

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-8 min-h-min">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Crear Nueva Clase
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={loading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Clase *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Emprendimiento 2024"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe de qué trata esta clase..."
            />
          </div>

          {/* Duración de la clase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⏰ Duración de la Clase *
            </label>
            
            <div className="space-y-3">
              {/* Selector de tipo de duración */}
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="days"
                    checked={durationType === 'days'}
                    onChange={(e) => setDurationType(e.target.value as 'days')}
                    className="mr-2"
                  />
                  <span className="text-sm">Por días</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="specific-date"
                    checked={durationType === 'specific-date'}
                    onChange={(e) => setDurationType(e.target.value as 'specific-date')}
                    className="mr-2"
                  />
                  <span className="text-sm">Fecha específica</span>
                </label>
              </div>

              {/* Campo condicional según el tipo */}
              {durationType === 'days' ? (
                <div>
                  <label htmlFor="duration" className="block text-xs text-gray-600 mb-1">
                    Número de días (1-365)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1"
                    max="365"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="30"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    ⏱️ Expira en {duration} días
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="specificDate" className="block text-xs text-gray-600 mb-1">
                    Fecha de finalización
                  </label>
                  <input
                    type="date"
                    id="specificDate"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    📅 Expira en la fecha seleccionada
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">💡 Nota:</span> Se generará un código único para que los estudiantes se inscriban.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Clase'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
