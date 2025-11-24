'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalInteractions: number;
  uniqueUsers: number;
  totalStudents?: number;
  interactionsByDate: Record<string, number>;
  interactionsByUser: Record<string, number>;
  userNames?: Record<string, string>;
}

interface AnalyticsDashboardProps {
  classId: string;
}

export default function AnalyticsDashboard({ classId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/classes/${classId}/interactions`);
        if (response.ok) {
          const result = await response.json();
          setData(result.stats);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [classId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const dates = Object.keys(data.interactionsByDate).sort();
  const maxInteractions = Math.max(...Object.values(data.interactionsByDate));
  
  // Top 5 usuarios más activos
  const topUsers = Object.entries(data.interactionsByUser)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-6">📈 Análisis de Actividad</h3>
      
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{data.totalInteractions}</div>
          <div className="text-sm text-blue-800">Total Interacciones</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{data.uniqueUsers}</div>
          <div className="text-sm text-green-800">Usuarios Activos</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{data.totalStudents || 0}</div>
          <div className="text-sm text-orange-800">Total Estudiantes</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.totalInteractions > 0 && data.uniqueUsers > 0 ? Math.round(data.totalInteractions / data.uniqueUsers) : 0}
          </div>
          <div className="text-sm text-purple-800">Promedio por Usuario</div>
        </div>
      </div>

      {/* Gráfico simple de barras para actividad diaria */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Actividad por Día</h4>
        <div className="space-y-2">
          {dates.slice(-7).map(date => {
            const count = data.interactionsByDate[date];
            const percentage = maxInteractions > 0 ? (count / maxInteractions) * 100 : 0;
            
            return (
              <div key={date} className="flex items-center space-x-3">
                <div className="w-24 text-xs text-gray-600 font-mono">
                  {new Date(date).toLocaleDateString('es-MX', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    <span className="text-xs text-white font-semibold">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top usuarios */}
      {topUsers.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Usuarios Más Activos</h4>
          <div className="space-y-2">
            {topUsers.map(([userId, count], index) => {
              const userName = data.userNames?.[userId] || `Usuario ${userId.substring(0, 8)}...`;
              return (
                <div key={userId} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{userName}</span>
                      <div className="text-xs text-gray-500">ID: {userId.substring(0, 8)}...</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">{count}</span>
                    <div className="text-xs text-gray-500">interacciones</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicadores de salud */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-semibold mb-3">Indicadores de Salud</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              data.totalInteractions > 50 ? 'bg-green-500' : 
              data.totalInteractions > 20 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              Nivel de Actividad: {
                data.totalInteractions > 50 ? 'Alto' : 
                data.totalInteractions > 20 ? 'Medio' : 'Bajo'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              data.uniqueUsers > 10 ? 'bg-green-500' : 
              data.uniqueUsers > 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              Participación: {
                data.uniqueUsers > 10 ? 'Excelente' : 
                data.uniqueUsers > 5 ? 'Buena' : 'Necesita mejora'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}