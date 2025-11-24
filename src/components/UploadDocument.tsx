'use client';

import { useState } from 'react';

interface UploadDocumentProps {
  classId: string;
  onUploadSuccess?: () => void;
}

export default function UploadDocument({ classId, onUploadSuccess }: UploadDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar que sea PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Solo se permiten archivos PDF');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/classes/${classId}/documents`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setMessage('Documento subido exitosamente');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Llamar callback si existe
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Subir Documento PDF
      </h3>
      
      <div className="space-y-4">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Seleccionar archivo PDF
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : 'Subir Documento'}
        </button>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Solo se permiten archivos PDF</p>
          <p>• Los documentos serán procesados automáticamente para el chatbot</p>
          <p>• Los alumnos podrán hacer preguntas sobre el contenido</p>
        </div>
      </div>
    </div>
  );
}
