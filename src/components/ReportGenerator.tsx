'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSession } from 'next-auth/react';

interface InteractionData {
  _id: string;
  pregunta: string;
  respuesta: string;
  fecha: string;
  usuario_id: string;
  usuario_nombre?: string;
  usuario_email?: string;
}

interface StatsData {
  totalInteractions: number;
  uniqueUsers: number;
  totalStudents: number;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  interactionsByDate: Record<string, number>;
  interactionsByUser: Record<string, number>;
  userNames: Record<string, string>;
}

interface ReportGeneratorProps {
  classId: string;
  className: string;
}

// Funciones auxiliares para cálculos estadísticos
const calculateStats = (values: number[]) => {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, median: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  return { min, max, avg: Math.round(avg * 100) / 100, median };
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

export default function ReportGenerator({ classId, className }: ReportGeneratorProps) {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<InteractionData[]>([]);

  // Función para obtener datos de interacciones
  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/interactions`);
      if (!response.ok) throw new Error('Error al obtener datos');
      
      const data = await response.json();
      return {
        interactions: data.interactions || [],
        stats: data.stats || null,
        classInfo: data.class || null
      };
    } catch (error) {
      console.error('Error:', error);
      return { interactions: [], stats: null, classInfo: null };
    }
  };

  // Función para generar estadísticas
  const generateStats = (interactions: InteractionData[]) => {
    const totalInteractions = interactions.length;
    const uniqueUsers = new Set(interactions.map(i => i.usuario_id)).size;
    
    // Calcular interacciones por día
    const interactionsByDate = interactions.reduce((acc, interaction) => {
      const dateStr = interaction.fecha || new Date().toISOString();
      const date = new Date(dateStr).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averagePerDay = Object.keys(interactionsByDate).length > 0 
      ? totalInteractions / Object.keys(interactionsByDate).length 
      : 0;

    return {
      totalInteractions,
      uniqueUsers,
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      mostActiveDay: Object.entries(interactionsByDate)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
    };
  };

  // Función para generar PDF de Seguimiento y Uso
  const generateBasicPDF = async () => {
    setIsGenerating(true);
    
    try {
      const { interactions, stats: apiStats, classInfo } = await fetchReportData();
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;
      
      // Título principal
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEGUIMIENTO Y USO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;
      
      // Información de la clase
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Clase: ${className}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      pdf.text(`Fecha del reporte: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Calcular estadísticas por día
      const interactionsByDate: Record<string, { count: number; users: Set<string> }> = {};
      interactions.forEach((interaction: InteractionData) => {
        const dateStr = interaction.fecha || new Date().toISOString();
        const date = new Date(dateStr).toISOString().split('T')[0];
        if (!interactionsByDate[date]) {
          interactionsByDate[date] = { count: 0, users: new Set() };
        }
        interactionsByDate[date].count++;
        interactionsByDate[date].users.add(interaction.usuario_id);
      });

      // Estadísticas por mes
      const interactionsByMonth: Record<string, { count: number; users: Set<string>; days: Set<string> }> = {};
      interactions.forEach((interaction: InteractionData) => {
        const dateStr = interaction.fecha || new Date().toISOString();
        const date = new Date(dateStr);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const dayKey = date.toISOString().split('T')[0];
        if (!interactionsByMonth[monthKey]) {
          interactionsByMonth[monthKey] = { count: 0, users: new Set(), days: new Set() };
        }
        interactionsByMonth[monthKey].count++;
        interactionsByMonth[monthKey].users.add(interaction.usuario_id);
        interactionsByMonth[monthKey].days.add(dayKey);
      });

      // Calcular estadísticas de visitantes y conversaciones por día
      const dailyVisitors = Object.values(interactionsByDate).map(d => d.users.size);
      const dailyConversations = Object.values(interactionsByDate).map(d => d.count);
      
      const visitorStats = calculateStats(dailyVisitors);
      const conversationStats = calculateStats(dailyConversations);
      
      // Calcular estadísticas por mes
      const monthlyVisitors = Object.values(interactionsByMonth).map(m => m.users.size);
      const monthlyConversations = Object.values(interactionsByMonth).map(m => m.count);
      
      const monthlyVisitorStats = calculateStats(monthlyVisitors);
      const monthlyConversationStats = calculateStats(monthlyConversations);

      // ===== TABLA POR DÍA =====
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('POR DÍA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Encabezados de tabla
      const colWidths = [55, 20, 22, 22, 22, 25, 25];
      const startX = 15;
      let currentX = startX;
      
      // Dibujar encabezados
      pdf.setFillColor(240, 240, 240);
      pdf.rect(startX, yPosition - 4, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
      pdf.setFontSize(8);
      
      const headers = ['CONCEPTO', 'Total', 'CANTIDAD', 'MÍNIMA', 'MÁXIMA', 'PROMEDIO', 'MEDIANA'];
      headers.forEach((header, i) => {
        pdf.text(header, currentX + 2, yPosition);
        currentX += colWidths[i];
      });
      yPosition += 8;

      // Filas de datos por día
      pdf.setFont('helvetica', 'normal');
      const dailyRows = [
        {
          concepto: 'Número de visitantes',
          total: new Set(interactions.map((i: InteractionData) => i.usuario_id)).size,
          cantidad: Object.keys(interactionsByDate).length,
          min: visitorStats.min,
          max: visitorStats.max,
          avg: visitorStats.avg,
          median: visitorStats.median
        },
        {
          concepto: 'Número de conversaciones',
          total: interactions.length,
          cantidad: Object.keys(interactionsByDate).length,
          min: conversationStats.min,
          max: conversationStats.max,
          avg: conversationStats.avg,
          median: conversationStats.median
        },
        {
          concepto: 'Tiempo utilizado en las conv.',
          total: '-',
          cantidad: '-',
          min: '-',
          max: '-',
          avg: '-',
          median: '-'
        }
      ];

      dailyRows.forEach(row => {
        currentX = startX;
        pdf.setFontSize(7);
        pdf.text(row.concepto, currentX + 2, yPosition);
        currentX += colWidths[0];
        pdf.text(String(row.total), currentX + 2, yPosition);
        currentX += colWidths[1];
        pdf.text(String(row.cantidad), currentX + 2, yPosition);
        currentX += colWidths[2];
        pdf.text(String(row.min), currentX + 2, yPosition);
        currentX += colWidths[3];
        pdf.text(String(row.max), currentX + 2, yPosition);
        currentX += colWidths[4];
        pdf.text(String(row.avg), currentX + 2, yPosition);
        currentX += colWidths[5];
        pdf.text(String(row.median), currentX + 2, yPosition);
        yPosition += 7;
      });

      // Dibujar líneas de tabla
      pdf.setDrawColor(200, 200, 200);
      for (let i = 0; i <= 4; i++) {
        pdf.line(startX, yPosition - 21 + (i * 7), startX + colWidths.reduce((a, b) => a + b, 0), yPosition - 21 + (i * 7));
      }

      yPosition += 15;

      // ===== TABLA POR MES =====
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('POR MES', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Encabezados
      currentX = startX;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(startX, yPosition - 4, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
      pdf.setFontSize(8);
      
      headers.forEach((header, i) => {
        pdf.text(header, currentX + 2, yPosition);
        currentX += colWidths[i];
      });
      yPosition += 8;

      // Filas de datos por mes
      pdf.setFont('helvetica', 'normal');
      const monthlyRows = [
        {
          concepto: 'Número de visitantes',
          total: new Set(interactions.map((i: InteractionData) => i.usuario_id)).size,
          cantidad: Object.keys(interactionsByMonth).length,
          min: monthlyVisitorStats.min,
          max: monthlyVisitorStats.max,
          avg: monthlyVisitorStats.avg,
          median: monthlyVisitorStats.median
        },
        {
          concepto: 'Número de conversaciones',
          total: interactions.length,
          cantidad: Object.keys(interactionsByMonth).length,
          min: monthlyConversationStats.min,
          max: monthlyConversationStats.max,
          avg: monthlyConversationStats.avg,
          median: monthlyConversationStats.median
        },
        {
          concepto: 'Tiempo utilizado en las conv.',
          total: '-',
          cantidad: '-',
          min: '-',
          max: '-',
          avg: '-',
          median: '-'
        }
      ];

      monthlyRows.forEach(row => {
        currentX = startX;
        pdf.setFontSize(7);
        pdf.text(row.concepto, currentX + 2, yPosition);
        currentX += colWidths[0];
        pdf.text(String(row.total), currentX + 2, yPosition);
        currentX += colWidths[1];
        pdf.text(String(row.cantidad), currentX + 2, yPosition);
        currentX += colWidths[2];
        pdf.text(String(row.min), currentX + 2, yPosition);
        currentX += colWidths[3];
        pdf.text(String(row.max), currentX + 2, yPosition);
        currentX += colWidths[4];
        pdf.text(String(row.avg), currentX + 2, yPosition);
        currentX += colWidths[5];
        pdf.text(String(row.median), currentX + 2, yPosition);
        yPosition += 7;
      });

      yPosition += 15;

      // ===== VISITANTES CON POCA ACTIVIDAD =====
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VISITANTES CON POCA ACTIVIDAD', startX, yPosition);
      yPosition += 8;

      // Identificar usuarios con pocas interacciones (menos de 3)
      const userInteractionCount: Record<string, { count: number; interactions: InteractionData[] }> = {};
      interactions.forEach((interaction: InteractionData) => {
        const userId = interaction.usuario_id;
        if (!userInteractionCount[userId]) {
          userInteractionCount[userId] = { count: 0, interactions: [] };
        }
        userInteractionCount[userId].count++;
        userInteractionCount[userId].interactions.push(interaction);
      });

      const lowActivityUsers = Object.entries(userInteractionCount)
        .filter(([_, data]) => data.count <= 5)
        .sort((a, b) => a[1].count - b[1].count);

      if (lowActivityUsers.length === 0) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(9);
        pdf.text('No hay visitantes con poca actividad (todos tienen más de 5 interacciones)', startX, yPosition);
        yPosition += 10;
      } else {
        // Mostrar últimas 10 interacciones de usuarios con poca actividad
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text('Últimas 10 Interacciones', startX + 60, yPosition);
        yPosition += 8;

        // Obtener las últimas interacciones de usuarios con poca actividad
        const lowActivityInteractions = lowActivityUsers
          .flatMap(([_, data]) => data.interactions)
          .sort((a, b) => new Date(b.fecha || new Date()).getTime() - new Date(a.fecha || new Date()).getTime())
          .slice(0, 10);

        lowActivityInteractions.forEach((interaction, index) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          const fechaStr = interaction.fecha || new Date().toISOString();
          const fecha = new Date(fechaStr).toLocaleDateString('es-ES');
          pdf.text(`${index + 1}. ${fecha}`, startX, yPosition);
          yPosition += 5;

          pdf.setFont('helvetica', 'normal');
          const pregunta = `P: ${interaction.pregunta || 'Sin pregunta'}`;
          const preguntaLines = pdf.splitTextToSize(pregunta, 170);
          pdf.text(preguntaLines, startX, yPosition);
          yPosition += preguntaLines.length * 4;

          const respuesta = `R: ${(interaction.respuesta || 'Sin respuesta').substring(0, 150)}...`;
          const respuestaLines = pdf.splitTextToSize(respuesta, 170);
          pdf.text(respuestaLines, startX, yPosition);
          yPosition += respuestaLines.length * 4 + 4;
        });
      }

      // Guardar PDF
      pdf.save(`seguimiento-uso-${className}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF básico. Detalle del error:', error);
      if (error instanceof Error) {
        alert('Error al generar el reporte: ' + error.message);
      } else {
        alert('Error al generar el reporte');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para generar reporte detallado
  const generateDetailedPDF = async () => {
    setIsGenerating(true);
    
    try {
      const { interactions } = await fetchReportData();
      const stats = generateStats(interactions);
      
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;
      
      // Título
      pdf.setFontSize(20);
      pdf.text('Reporte Detallado - MentorBot', 20, yPosition);
      yPosition += 20;
      
      // Información de la clase
      pdf.setFontSize(14);
      pdf.text(`Clase: ${className}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`ID de Clase: ${classId}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Fecha del reporte: ${new Date().toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Generado por: ${session?.user?.name || 'Usuario'}`, 20, yPosition);
      yPosition += 20;
      
      // Resumen ejecutivo
      pdf.setFontSize(16);
      pdf.text('Resumen Ejecutivo', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      const resumen = [
        `Este reporte analiza la actividad de MentorBot durante el período registrado.`,
        `Se han procesado ${stats.totalInteractions} interacciones de ${stats.uniqueUsers} usuarios únicos.`,
        `El promedio de interacciones por día es de ${stats.averagePerDay}.`,
        `La plataforma muestra un ${stats.totalInteractions > 50 ? 'alto' : 'moderado'} nivel de engagement estudiantil.`
      ];
      
      resumen.forEach(linea => {
        const lines = pdf.splitTextToSize(linea, 170);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 6 + 2;
      });
      
      yPosition += 10;
      
      // Estadísticas detalladas
      pdf.setFontSize(16);
      pdf.text('Métricas de Uso', 20, yPosition);
      yPosition += 15;
      
      const metricas = [
        ['Total de Interacciones', stats.totalInteractions.toString()],
        ['Usuarios Únicos', stats.uniqueUsers.toString()],
        ['Promedio Diario', stats.averagePerDay.toString()],
        ['Día Más Activo', stats.mostActiveDay || 'N/A'],
        ['Período de Análisis', `${interactions.length > 0 ? new Date(interactions[0].fecha || new Date()).toLocaleDateString() : 'N/A'} - ${new Date().toLocaleDateString()}`]
      ];
      
      pdf.setFontSize(11);
      metricas.forEach(([etiqueta, valor]) => {
        pdf.text(`• ${etiqueta}: ${valor}`, 20, yPosition);
        yPosition += 8;
      });
      
      yPosition += 15;
      
      // Análisis de tendencias
      pdf.setFontSize(16);
      pdf.text('Análisis de Tendencias', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(11);
      const analisis = [
        `Nivel de actividad: ${stats.totalInteractions > 100 ? 'Alto' : stats.totalInteractions > 50 ? 'Medio' : 'Bajo'}`,
        `Engagement estudiantil: ${stats.averagePerDay > 5 ? 'Excelente' : stats.averagePerDay > 2 ? 'Bueno' : 'Requiere mejora'}`,
        `Diversidad de usuarios: ${stats.uniqueUsers > 10 ? 'Alta participación' : 'Participación moderada'}`
      ];
      
      analisis.forEach(linea => {
        pdf.text(`• ${linea}`, 20, yPosition);
        yPosition += 8;
      });
      
      // Nueva página para interacciones
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.text('Historial de Interacciones', 20, yPosition);
      yPosition += 15;
      
      // Mostrar todas las interacciones
      interactions.reverse().forEach((interaction: InteractionData, index: number) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        const fechaStr = interaction.fecha || new Date().toISOString();
        const fecha = new Date(fechaStr).toLocaleString();
        pdf.text(`${index + 1}. ${fecha}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFont(undefined, 'normal');
        
        // Pregunta
        const pregunta = `Pregunta: ${interaction.pregunta || 'Sin pregunta'}`;
        const preguntaLines = pdf.splitTextToSize(pregunta, 170);
        pdf.text(preguntaLines, 20, yPosition);
        yPosition += preguntaLines.length * 5 + 3;
        
        // Respuesta
        const respuesta = `Respuesta: ${interaction.respuesta || 'Sin respuesta'}`;
        const respuestaLines = pdf.splitTextToSize(respuesta, 170);
        pdf.text(respuestaLines, 20, yPosition);
        yPosition += respuestaLines.length * 5 + 8;
      });
      
      // Guardar PDF
      pdf.save(`reporte-detallado-${className}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF detallado. Detalle del error:', error);
      if (error instanceof Error) {
        alert('Error al generar el reporte detallado: ' + error.message);
      } else {
        alert('Error al generar el reporte detallado');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">📊 Generador de Reportes</h3>
      <p className="text-gray-600 mb-6">
        Genera reportes en PDF con las estadísticas y actividad de MentorBot.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Reporte de Seguimiento y Uso */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">📈 Seguimiento y Uso</h4>
          <p className="text-sm text-gray-600 mb-4">
            Tablas de métricas por día y mes, visitantes con poca actividad.
          </p>
          <button
            onClick={generateBasicPDF}
            disabled={isGenerating}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generando...' : 'Generar Reporte de Seguimiento'}
          </button>
        </div>
        
        {/* Reporte Detallado */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">📋 Reporte Detallado</h4>
          <p className="text-sm text-gray-600 mb-4">
            Análisis completo con todas las interacciones y métricas.
          </p>
          <button
            onClick={generateDetailedPDF}
            disabled={isGenerating}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generando...' : 'Generar Reporte Detallado'}
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold mb-2">ℹ️ Información de los Reportes</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Seguimiento y Uso:</strong> Métricas por día/mes (visitantes, conversaciones), usuarios con poca actividad</li>
          <li>• <strong>Reporte Detallado:</strong> Análisis completo con historial de todas las interacciones</li>
          <li>• Los reportes se descargan automáticamente en formato PDF</li>
          <li>• Incluye métricas de engagement y tendencias de uso</li>
        </ul>
      </div>
    </div>
  );
}