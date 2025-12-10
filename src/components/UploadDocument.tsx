'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

interface UploadDocumentProps {
  classId: string;
  onUploadSuccess?: () => void;
}

export default function UploadDocument({ classId, onUploadSuccess }: UploadDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar que sea PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Solo se permiten archivos PDF');
        setFile(null);
        return;
      }
      // Validar tamaño máximo (100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 100MB.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setMessage('');
      setProgress(0);
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
    setProgress(0);

    try {
      // Upload directo a Vercel Blob (soporta archivos grandes)
      const fileName = `${Date.now()}_${file.name}`;
      
      setProgress(10);
      setMessage('Iniciando subida...');
      
      const blob = await upload(fileName, file, {
        access: 'public',
        handleUploadUrl: `/api/classes/${classId}/documents/upload-token`,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
          setMessage(`Subiendo archivo... ${percentCompleted}%`);
        },
      });

      console.log('Archivo subido:', blob.url);
      setProgress(100);
      setMessage('✅ Documento subido exitosamente. Procesando automáticamente...');
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Esperar 3 segundos para que el usuario vea el mensaje
      setTimeout(() => {
        setMessage('🔄 El documento se está procesando en segundo plano. Aparecerá en la lista en unos momentos.');
        
        // Después de otros 2 segundos, refrescar
        setTimeout(() => {
          router.refresh();
          if (onUploadSuccess) {
            onUploadSuccess();
          }
        }, 2000);
      }, 3000);
    } catch (err) {
      console.error('Error uploading:', err);
      let errorMessage = 'Error desconocido al subir el archivo';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Mensajes más específicos
      if (errorMessage.includes('JSON')) {
        errorMessage = '❌ Error de comunicación con el servidor. Por favor intenta de nuevo.';
      } else if (errorMessage.includes('size') || errorMessage.includes('large')) {
        errorMessage = '❌ El archivo es demasiado grande. Máximo 100MB permitidos.';
      } else if (errorMessage.includes('PDF') || errorMessage.includes('pdf')) {
        errorMessage = '❌ Solo se permiten archivos PDF.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = '❌ Error de conexión. Verifica tu internet e intenta de nuevo.';
      }
      
      setError(errorMessage);
      setProgress(0);
      setMessage('');
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
          {uploading ? `Subiendo... ${progress}%` : 'Subir Documento'}
        </button>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

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
          <p>• Solo se permiten archivos PDF (máximo 100MB)</p>
          <p>• Los documentos serán procesados automáticamente para MentorBot</p>
          <p>• Los alumnos podrán conversar con MentorBot sobre el contenido</p>
        </div>
      </div>
    </div>
  );
}
