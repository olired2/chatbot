'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import SessionCleanup from '@/components/SessionCleanup';

import { useSession, signOut } from 'next-auth/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar si el clic fue en el botón o en el dropdown
      const isClickOnButton = buttonRef.current && buttonRef.current.contains(target);
      const isClickOnDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      
      // Solo cerrar si el clic no fue en el botón ni en el dropdown
      if (!isClickOnButton && !isClickOnDropdown) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isUserMenuOpen]);

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevenir propagación del evento
    console.log('🔍 Toggling dropdown, current state:', isUserMenuOpen);
    
    // Calcular posición del botón solo si se va a abrir
    if (!isUserMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
    
    setIsUserMenuOpen(prev => {
      const newState = !prev;
      console.log('🔄 New state will be:', newState);
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SessionCleanup />
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/dashboard" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                  <img 
                    src="/logo-chatbot.svg" 
                    alt="MentorBot" 
                    className="w-8 h-8"
                  />
                  <span className="text-lg md:text-xl font-bold">MentorBot</span>
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {session?.user.role === 'Maestro' ? (
                  <>
                    <Link href="/dashboard/classes" className="text-gray-800 font-medium inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600 transition-colors text-sm lg:text-base">
                      <span className="hidden lg:inline">📚 </span>Mis Clases
                    </Link>
                    <Link href="/dashboard/emails" className="text-gray-800 font-medium inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600 transition-colors text-sm lg:text-base">
                      <span className="hidden lg:inline">📧 </span>Correos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard/chat" className="text-gray-800 font-medium inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500 hover:text-indigo-600 transition-colors text-sm lg:text-base">
                      <span className="hidden lg:inline">💬 </span>Chat
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Desktop User Menu */}
              <div className="hidden sm:flex sm:items-center">
                <div className="relative" style={{ position: 'relative', zIndex: 9999 }}>
                  <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleDropdown}
                    className={`flex items-center space-x-2 md:space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 border hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isUserMenuOpen ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs md:text-sm">👤</span>
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[100px] lg:max-w-[120px]">
                        {session?.user?.name || session?.user?.email || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session?.user?.role || 'Usuario'}
                      </p>
                    </div>
                    <span className={`text-gray-400 transition-transform duration-200 hidden md:inline ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Abrir menú principal</span>
                  {!isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                {session?.user.role === 'Maestro' ? (
                  <>
                    <Link 
                      href="/dashboard/classes" 
                      className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📚 Mis Clases
                    </Link>
                    <Link 
                      href="/dashboard/emails" 
                      className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📧 Correos Motivacionales
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/dashboard/chat" 
                      className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      💬 Chat con Mentor
                    </Link>
                  </>
                )}
                
                {/* Mobile user info */}
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {session?.user?.name || session?.user?.email || 'Usuario'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session?.user?.role || 'Usuario'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      href="/dashboard/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👤 Mi Perfil
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/login' })}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-visible">
            {children}
          </div>
        </div>
      </main>

      {/* Portal Dropdown - Teacher Menu */}
      {isUserMenuOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-white rounded-xl shadow-lg border border-gray-200 w-56 transform transition-all duration-200 ease-out"
          style={{ 
            top: buttonPosition.top,
            right: buttonPosition.right,
            zIndex: 99999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || session?.user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-blue-600 font-medium">Maestro</p>
            </div>
            
            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/dashboard/profile"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => {
                  console.log('🔗 Profile link clicked');
                  setIsUserMenuOpen(false);
                }}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm">⚙️</span>
                </div>
                <span className="font-medium">Mi Perfil</span>
              </Link>
              
              <button
                onClick={() => {
                  console.log('🚪 Logout clicked');
                  signOut({ callbackUrl: '/auth/login' });
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm">🚪</span>
                </div>
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}