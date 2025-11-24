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
        Sistema que envía correos automáticos a estudiantes que no han interactuado con el chatbot por 15 días o más.
      </p>

      {/* Controles principales */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runEmailProcess}
          disabled={isSending}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Enviando...
            </>
          ) : (
            <>
              📨 Ejecutar Proceso Manual
            </>
          )}
        </button>
        
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {isLoading ? 'Cargando...' : '🔄 Actualizar Estadísticas'}
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

      {/* Estadísticas */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Resumen de estadísticas */}
          <div>
            <h4 className="font-semibold mb-3">📊 Estadísticas Generales</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Total de correos enviados</span>
                <span className="font-bold text-blue-600">{stats.totalEmails}</span>
              </div>
              
              {stats.stats.map((stat) => (
                <div key={stat._id} className={`flex justify-between items-center p-3 rounded ${
                  stat._id === 'enviado' ? 'bg-green-50 border border-green-200' :
                  stat._id === 'fallido' ? 'bg-red-50 border border-red-200' :
                  stat._id === 'pendiente' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-gray-50'
                }`}>
                  <span className={`font-medium ${
                    stat._id === 'enviado' ? 'text-green-700' :
                    stat._id === 'fallido' ? 'text-red-700' :
                    stat._id === 'pendiente' ? 'text-yellow-700' :
                    'text-gray-700'
                  }`}>
                    {stat._id === 'enviado' ? '✅ Enviados exitosamente' :
                     stat._id === 'fallido' ? '❌ Fallidos' :
                     stat._id === 'pendiente' ? '⏳ Pendientes' : stat._id}
                  </span>
                  <span className={`font-bold text-lg ${
                    stat._id === 'enviado' ? 'text-green-600' :
                    stat._id === 'fallido' ? 'text-red-600' :
                    stat._id === 'pendiente' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Correos recientes */}
          <div>
            <h4 className="font-semibold mb-3">📋 Correos Recientes</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {stats.recentEmails.length > 0 ? (
                stats.recentEmails.map((email) => (
                  <div key={email._id} className={`border-l-4 rounded-r p-3 text-sm ${
                    email.estado === 'enviado' ? 'border-green-500 bg-green-50' :
                    email.estado === 'fallido' ? 'border-red-500 bg-red-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">{email.email_enviado_a}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        email.estado === 'enviado' ? 'bg-green-200 text-green-800' :
                        email.estado === 'fallido' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {email.estado === 'enviado' ? '✅ enviado' :
                         email.estado === 'fallido' ? '❌ fallido' :
                         '⏳ pendiente'}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span>📅 {new Date(email.fecha_envio).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏰ {email.dias_inactividad} días inactivo</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-500">No hay correos enviados aún</p>
                  <p className="text-gray-400 text-sm">Los correos aparecerán aquí una vez enviados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-semibold mb-2 text-blue-800">ℹ️ Cómo Funciona</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• El sistema verifica automáticamente la inactividad de estudiantes</li>
          <li>• Se envía un correo motivacional después de 15 días sin interacción</li>
          <li>• No se envían correos duplicados en un período de 7 días</li>
          <li>• Los correos incluyen enlaces directos al chatbot y consejos personalizados</li>
          <li>• Puedes ejecutar el proceso manualmente o programarlo para ejecución automática</li>
        </ul>
      </div>

      {/* Alerta para correos fallidos */}
      {stats && stats.stats.some(stat => stat._id === 'fallido' && stat.count > 0) && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h5 className="font-semibold mb-2 text-red-800">🚨 Correos Fallidos Detectados</h5>
          <p className="text-sm text-red-700 mb-2">
            Algunos correos han fallado al enviarse. Esto suele ocurrir cuando las credenciales de correo no están configuradas correctamente.
          </p>
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded font-mono">
            Revisa las variables de entorno: EMAIL_USER, EMAIL_PASS, EMAIL_HOST
          </div>
        </div>
      )}

      {/* Configuración de correo */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold mb-2 text-blue-800">⚙️ Configuración de Correo</h5>
        <p className="text-sm text-blue-700 mb-2">
          Para habilitar el envío automático de correos, configura las siguientes variables en <code className="bg-blue-100 px-1 rounded">.env.local</code>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-100 p-2 rounded font-mono text-blue-800">
            <div>EMAIL_HOST="smtp.gmail.com"</div>
            <div>EMAIL_PORT="587"</div>
          </div>
          <div className="bg-blue-100 p-2 rounded font-mono text-blue-800">
            <div>EMAIL_USER="tu-email@gmail.com"</div>
            <div>EMAIL_PASS="tu-app-password"</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          💡 <strong>Tip:</strong> Para Gmail, necesitas generar una "Contraseña de aplicación" desde la configuración de tu cuenta Google.
        </div>
      </div>
    </div>
  );
}