'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SessionCleanup from '@/components/SessionCleanup';
import { useAutoLogout } from '@/lib/hooks/useAutoLogout';
import { useSession, signOut } from 'next-auth/react';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
  const { data: session } = useSession();
  useAutoLogout(); // Auto-logout por inactividad
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    event.preventDefault();
    event.stopPropagation();
    console.log('🔍 Clicking dropdown button - current state:', isUserMenuOpen);
    setIsUserMenuOpen(!isUserMenuOpen);
    console.log('🔄 New state will be:', !isUserMenuOpen);
  };

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

            {/* Desktop User Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={toggleDropdown}
                  className={`flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 border hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isUserMenuOpen ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🎓</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {session?.user?.name || session?.user?.email || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.role || 'Estudiante'}
                    </p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                  {isUserMenuOpen && (
                    <span className="ml-2 text-xs bg-red-500 text-white px-1 rounded">ABIERTO</span>
                  )}
                </button>

                {/* Dropdown Menu - Relative positioning */}
                {isUserMenuOpen && (
                  <div 
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 transform transition-all duration-200 ease-out z-[9999]"
                    onClick={(e) => e.stopPropagation()}
                    style={{ zIndex: 9999 }}
                  >
                    <div className="py-2">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session?.user?.name || session?.user?.email || 'Usuario'}
                        </p>
                        <p className="text-xs text-indigo-600 font-medium">Estudiante</p>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/estudiante/profile"
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
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center space-x-2">
              {/* Mobile User Button */}
              <button
                ref={buttonRef}
                type="button"
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-150"
              >
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">🎓</span>
                </div>
                <span className="text-xs max-w-[60px] truncate">
                  {session?.user?.name?.split(' ')[0] || 'Usuario'}
                </span>
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🎓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.role || 'Estudiante'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile Navigation Links */}
              <Link 
                href="/estudiante" 
                className={`text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/estudiante' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎓 Mis Clases
              </Link>
              
              {/* Mobile Sign Out */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut({ callbackUrl: '/auth/login' });
                }}
                className="w-full text-left text-red-600 hover:bg-red-50 block px-3 py-2 rounded-md text-base font-medium"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        )}
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