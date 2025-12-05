'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import SessionCleanup from '@/components/SessionCleanup';
import { useSession, signOut } from 'next-auth/react';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
              <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 9999 }}>
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
                      {session?.user?.role || 'Usuario'}
                    </p>
                  </div>
                  <span className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>


              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
            <Link href="/estudiante" className="text-gray-800 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
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

      {/* Portal Dropdown - Final Design */}
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
                {session?.user?.nombre || session?.user?.email || 'Usuario'}
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
        </div>,
        document.body
      )}
    </div>
  );
}