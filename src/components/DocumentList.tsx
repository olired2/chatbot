'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Document {
  name: string;
  uploadedAt: string;
  size?: number;
  embeddings?: boolean;
  processed?: boolean;
  path: string;
  _id?: string;
}

interface DocumentListProps {
  classId: string;
  documents: Document[];
}

export default function DocumentList({ classId, documents }: DocumentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  // Auto-refresh cada 5 segundos si hay documentos pendientes
  useEffect(() => {
    const hasPendingDocs = documents.some(doc => !doc.embeddings && !doc.processed);
    
    if (hasPendingDocs) {
      const interval = setInterval(() => {
        console.log('🔄 Refrescando estado de documentos...');
        router.refresh();
      }, 5000); // Cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [documents, router]);

  const handleDelete = async (docName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${docName}"?`)) {
      return;
    }

    setDeleting(docName);

    try {
      const response = await fetch(`/api/classes/${classId}/documents`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentName: docName }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el documento');
      }

      // Recargar la página para mostrar los cambios
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el documento');
    } finally {
      setDeleting(null);
    }
  };

  const handleProcess = async (doc: Document) => {
    setProcessing(doc.name);

    try {
      const response = await fetch(`/api/classes/${classId}/documents/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: doc._id || doc.name,
          documentUrl: doc.path,
        }),
      });

      // Verificar que la respuesta es JSON válida
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Respuesta inválida del servidor: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error al procesar documento');
      }

      alert(`✅ Documento procesado exitosamente en ${data.chunks} fragmentos`);
      
      // Recargar documentos después de procesar
      await new Promise(resolve => setTimeout(resolve, 500)); // Esperar un poco para que MongoDB actualice
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(`❌ ${error instanceof Error ? error.message : 'Error al procesar documento'}`);
    } finally {
      setProcessing(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm">No hay documentos subidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{doc.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Subido: {new Date(doc.uploadedAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {doc.size && (
                <p className="text-xs text-gray-500">
                  Tamaño: {(doc.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            <div className="ml-4 flex items-center gap-2">
              {doc.embeddings ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Procesado
                </span>
              ) : doc.processed === false && !processing ? (
                <>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                    🔄 Procesando...
                  </span>
                  <span className="text-xs text-gray-500">(Espera unos segundos)</span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏳ Pendiente
                  </span>
                  <button
                    onClick={() => handleProcess(doc)}
                    disabled={processing === doc.name}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Procesar documento para búsqueda semántica"
                  >
                    {processing === doc.name ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      'Procesar'
                    )}
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(doc.name)}
                disabled={deleting === doc.name}
                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                title="Eliminar documento"
              >
                {deleting === doc.name ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
