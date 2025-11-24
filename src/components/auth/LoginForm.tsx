'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar si viene de registro exitoso
    const registered = searchParams.get('registered');
    const email = searchParams.get('email');
    const verified = searchParams.get('verified');
    
    if (verified === 'true') {
      setSuccessMessage('¡Email verificado exitosamente! Ya puedes iniciar sesión.');
    } else if (registered === 'true') {
      if (email) {
        setSuccessMessage(`📧 Registro exitoso! Hemos enviado un email de verificación a ${email}. Por favor verifica tu correo antes de iniciar sesión. Una vez verificado, podrás unirte a clases desde tu dashboard.`);
      } else {
        setSuccessMessage('¡Registro exitoso! Por favor verifica tu correo antes de iniciar sesión. Una vez verificado, podrás unirte a clases desde tu dashboard.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Intentando iniciar sesión con:', { email });
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.log('Error al iniciar sesión:', result.error);
        setError('Credenciales inválidas');
        return;
      }

      console.log('Inicio de sesión exitoso');
      router.push('/dashboard');
    } catch (error) {
      setError('Ocurrió un error al intentar iniciar sesión');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Campo Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Campo Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Botón de login */}
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        Iniciar sesión
      </button>

      {/* Enlaces adicionales */}
      <div className="text-center pt-4 space-y-2">
        <Link 
          href="/auth/forgot-password" 
          className="block text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        
        <div className="pt-2">
          <p className="text-gray-500 text-sm mb-2">
            ¿No tienes cuenta?
          </p>
          <Link 
            href="/auth/register" 
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
          >
            Registrarse aquí
          </Link>
        </div>
      </div>
    </form>
  );
}