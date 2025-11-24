'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<{email?: string, name?: string}>({});
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(result.message);
          setUserInfo({
            email: result.userEmail,
            name: result.userName
          });
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push('/auth/login?verified=true');
          }, 3000);
          
        } else {
          setStatus(result.expired ? 'expired' : 'error');
          setMessage(result.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error de conexión. Intenta nuevamente.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-2">
            <div className="relative">
              {/* Robot principal */}
              <div className="w-8 h-6 bg-gray-800 rounded-lg mb-1 mx-auto"></div>
              {/* Ojos */}
              <div className="flex justify-center space-x-1 -mt-4 mb-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
              </div>
              {/* Sonrisa */}
              <div className="w-3 h-1 border-b-2 border-cyan-400 rounded-full mx-auto -mt-1"></div>
              {/* Libro */}
              <div className="w-6 h-3 bg-white rounded-sm mx-auto mt-2 border border-gray-200">
                <div className="h-px bg-gray-300 mt-1"></div>
                <div className="h-px bg-gray-300 mt-0.5"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Verificando tu email...</h2>
                <p className="text-gray-600">Por favor espera mientras procesamos tu verificación.</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-green-600">✅</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">¡Email Verificado!</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                {userInfo.name && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-green-800 text-sm">
                      <strong>¡Bienvenido {userInfo.name}!</strong><br/>
                      Tu cuenta ({userInfo.email}) ha sido verificada exitosamente.
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  Serás redirigido al login en unos segundos...
                </p>
                <Link 
                  href="/auth/login?verified=true"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Ir al Login
                </Link>
              </>
            )}
            
            {status === 'expired' && (
              <>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-yellow-600">⏰</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Token Expirado</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    El enlace de verificación ha expirado. Por seguridad, los enlaces solo son válidos por 24 horas.
                  </p>
                </div>
                <Link 
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Registrarse Nuevamente
                </Link>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-red-600">❌</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Verificación</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-red-800 text-sm">
                    No se pudo verificar tu email. El enlace puede ser inválido o tu cuenta ya fue verificada.
                  </p>
                </div>
                <div className="flex space-x-3 justify-center">
                  <Link 
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Ir al Login
                  </Link>
                  <Link 
                    href="/auth/register"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>© 2025 MentorBot - Educación Inteligente</p>
        </div>
      </div>
    </div>
  );
}