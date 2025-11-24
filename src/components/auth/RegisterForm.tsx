'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 5) {
      setError('La contraseña debe tener al menos 5 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          password: formData.password,
          rol: 'Estudiante',
          institucion: formData.institution
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar');
      }

      // Mostrar mensaje de éxito y redirigir
      alert(`¡Registro exitoso! 📧\n\nHemos enviado un email de verificación a ${formData.email}.\n\nPor favor revisa tu correo (incluyendo spam) y haz clic en el enlace de verificación antes de iniciar sesión.\n\nUna vez verificado, podrás unirte a clases desde el dashboard.`);
      
      // Redirigir al login con mensaje
      const params = new URLSearchParams({
        registered: 'true',
        email: formData.email
      });
      
      router.push(`/auth/login?${params.toString()}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Campo Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ingresa tu nombre completo"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

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
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="tu@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Campo Institución */}
        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
            Institución educativa
          </label>
          <input
            id="institution"
            name="institution"
            type="text"
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Nombre de tu escuela o universidad"
            value={formData.institution}
            onChange={handleChange}
          />
        </div>



        {/* Campos de Contraseña - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 5 caracteres</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>



      {/* Botón de registro */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creando cuenta...
          </div>
        ) : (
          'Crear cuenta'
        )}
      </button>

      {/* Link al login */}
      <div className="text-center pt-4">
        <p className="text-gray-500 text-sm mb-2">
          ¿Ya tienes una cuenta?
        </p>
        <Link 
          href="/auth/login" 
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
        >
          Iniciar sesión aquí
        </Link>
      </div>
    </form>
  );
}