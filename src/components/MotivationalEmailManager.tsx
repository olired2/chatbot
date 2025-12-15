'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface EmailStats {
  success: boolean;
  totalEmails: number;
  stats: Array<{
    _id: string;
    count: number;
    ultimoEnvio: string;
  }>;
  recentEmails: Array<{
    _id: string;
    email_enviado_a: string;
    dias_inactividad: number;
    fecha_envio: string;
    estado: string;
    tipo_correo: string;
  }>;
}

export default function MotivationalEmailManager() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Cargar estadísticas
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/motivational-emails');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ejecutar proceso de correos motivacionales
  const runEmailProcess = async () => {
    setIsSending(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/motivational-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        await loadStats(); // Recargar estadísticas
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Error conectando con el servidor');
      console.error('Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'Maestro') {
      loadStats();
    }
  }, [session]);

  if (session?.user?.role !== 'Maestro') {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">📧 Correos Motivacionales Automáticos</h3>
      <p className="text-gray-600 mb-6">
        Sistema que envía correos automáticos a estudiantes que no han interactuado con MentorBot por 15 días o más.
      </p>

      {/* Controles principales */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runEmailProcess}
          disabled={isSending}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base font-medium"
        >
          {isSending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Enviando correos...
            </>
          ) : (
            <>
              📨 Enviar Correos a Estudiantes Inactivos
            </>
          )}
        </button>
      </div>

      {/* Mensaje de resultado */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Estadísticas simplificadas */}
      {stats && (
        <div>
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="font-semibold text-green-800">Correos enviados:</span>
            <span className="text-2xl font-bold text-green-600">{stats.totalEmails}</span>
          </div>
        </div>
      )}
    </div>
  );
}