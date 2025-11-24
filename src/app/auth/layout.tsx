export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Icono principal */}
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
          {children}
        </div>
      </div>
    </div>
  );
}