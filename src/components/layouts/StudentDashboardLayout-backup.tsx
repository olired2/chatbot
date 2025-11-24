'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SessionCleanup from '@/components/SessionCleanup';
import { useSession, signOut } from 'next-auth/react';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <SessionCleanup />
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/estudiante" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                  <img 
                    src="/logo-chatbot.svg" 
                    alt="MentorBot" 
                    className="w-8 h-8"
                  />
                  <span className="text-xl font-bold">MentorBot</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/estudiante" className="text-gray-800 font-medium inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                  🎓 Mis Clases
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative" ref={dropdownRef}>
                <div>
                  <button
                    onClick={() => {
                      console.log('Button clicked, current state:', isUserMenuOpen);
                      setIsUserMenuOpen(!isUserMenuOpen);
                      console.log('New state will be:', !isUserMenuOpen);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">🎓</span>
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user.nombre || session?.user.email}
                      </p>
                      <p className="text-xs text-gray-500">Estudiante</p>
                    </div>
                    <span className={`ml-1 text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl bg-white ring-1 ring-gray-200 z-[9999] border border-gray-100">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session?.user.nombre || session?.user.email}
                        </p>
                        <p className="text-xs text-gray-500">Estudiante</p>
                      </div>
                      <Link
                        href="/estudiante/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                          <span className="text-xs">⚙️</span>
                        </div>
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center mr-3">
                          <span className="text-xs">🚪</span>
                        </div>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
            
            {/* Navegación móvil */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => signOut()}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
        
        {/* Navegación móvil expandida */}
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/estudiante" className="text-gray-800 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">
              🎓 Mis Clases
            </Link>
          </div>
        </div>
      </nav>

      <main className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-visible">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}