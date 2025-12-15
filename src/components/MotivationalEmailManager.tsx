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
      <h3 className="text-xl font-bold mb-2">📧 Correos Motivacionales Automáticos</h3>
      <p className="text-gray-600 mb-6">
        El sistema envía automáticamente cada mañana a las 9:00 AM correos motivacionales a estudiantes que no han interactuado por 15 días o más.
      </p>

      {/* Controles principales */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">⏰ Ejecución automática:</span> Diaria a las 9:00 AM
        </p>
      </div>

      {/* Mensaje de resultado */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Estadísticas y Correos Recientes */}
      {stats && (
        <div className="space-y-6">
          {/* Total de correos */}
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="font-semibold text-green-800">Correos enviados:</span>
            <span className="text-2xl font-bold text-green-600">{stats.totalEmails}</span>
          </div>

          {/* Correos recientes */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">📋 Correos Enviados Recientemente</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {stats.recentEmails.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {stats.recentEmails.map((email) => (
                    <div key={email._id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{email.email_enviado_a}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Enviado hace: {new Date(email.fecha_envio).toLocaleDateString('es-MX', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          email.estado === 'enviado' ? 'bg-green-100 text-green-800' :
                          email.estado === 'fallido' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {email.estado === 'enviado' ? '✅ Enviado' :
                           email.estado === 'fallido' ? '❌ Fallido' :
                           '⏳ Pendiente'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 flex gap-4">
                        <span>📧 {email.tipo_correo === 'inactividad_15_dias' ? 'Inactividad (15 días)' : email.tipo_correo}</span>
                        <span>⏰ {email.dias_inactividad} días sin interacción</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-600">No hay correos enviados aún</p>
                  <p className="text-gray-400 text-sm mt-1">Los correos aparecerán aquí una vez que se envíen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}