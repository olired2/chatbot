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
}

interface ReportGeneratorProps {
  classId: string;
  className: string;
}

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
      return data.interactions || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  // Función para generar estadísticas
  const generateStats = (interactions: InteractionData[]) => {
    const totalInteractions = interactions.length;
    const uniqueUsers = new Set(interactions.map(i => i.usuario_id)).size;
    
    // Calcular interacciones por día
    const interactionsByDate = interactions.reduce((acc, interaction) => {
      const date = new Date(interaction.fecha).toDateString();
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

  // Función para generar PDF básico
  const generateBasicPDF = async () => {
    setIsGenerating(true);
    
    try {
      const interactions = await fetchReportData();
      const stats = generateStats(interactions);
      
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;
      
      // Título
      pdf.setFontSize(20);
      pdf.text('Reporte de Actividad del Chatbot', 20, yPosition);
      yPosition += 20;
      
      // Información de la clase
      pdf.setFontSize(14);
      pdf.text(`Clase: ${className}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Fecha del reporte: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Generado por: ${session?.user?.name || 'Usuario'}`, 20, yPosition);
      yPosition += 20;
      
      // Estadísticas generales
      pdf.setFontSize(16);
      pdf.text('Estadísticas Generales', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.text(`Total de interacciones: ${stats.totalInteractions}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Usuarios únicos: ${stats.uniqueUsers}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Promedio por día: ${stats.averagePerDay}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Día más activo: ${stats.mostActiveDay}`, 20, yPosition);
      yPosition += 20;
      
      // Últimas interacciones
      pdf.setFontSize(16);
      pdf.text('Últimas 10 Interacciones', 20, yPosition);
      yPosition += 15;
      
      const recentInteractions = interactions.slice(-10).reverse();
      
      recentInteractions.forEach((interaction, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(10);
        const fecha = new Date(interaction.fecha).toLocaleDateString();
        pdf.text(`${index + 1}. ${fecha}`, 20, yPosition);
        yPosition += 6;
        
        // Pregunta
        const pregunta = `P: ${interaction.pregunta}`;
        const preguntaLines = pdf.splitTextToSize(pregunta, 170);
        pdf.text(preguntaLines, 20, yPosition);
        yPosition += preguntaLines.length * 5;
        
        // Respuesta (truncada)
        const respuesta = `R: ${interaction.respuesta.substring(0, 200)}...`;
        const respuestaLines = pdf.splitTextToSize(respuesta, 170);
        pdf.text(respuestaLines, 20, yPosition);
        yPosition += respuestaLines.length * 5 + 5;
      });
      
      // Guardar PDF
      pdf.save(`reporte-chatbot-${className}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para generar reporte detallado
  const generateDetailedPDF = async () => {
    setIsGenerating(true);
    
    try {
      const interactions = await fetchReportData();
      const stats = generateStats(interactions);
      
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;
      
      // Título
      pdf.setFontSize(20);
      pdf.text('Reporte Detallado - Chatbot Educativo', 20, yPosition);
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
        `Este reporte analiza la actividad del chatbot educativo durante el período registrado.`,
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
        ['Día Más Activo', stats.mostActiveDay],
        ['Período de Análisis', `${interactions.length > 0 ? new Date(interactions[0].fecha).toLocaleDateString() : 'N/A'} - ${new Date().toLocaleDateString()}`]
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
      interactions.reverse().forEach((interaction, index) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        const fecha = new Date(interaction.fecha).toLocaleString();
        pdf.text(`${index + 1}. ${fecha}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFont(undefined, 'normal');
        
        // Pregunta
        const pregunta = `Pregunta: ${interaction.pregunta}`;
        const preguntaLines = pdf.splitTextToSize(pregunta, 170);
        pdf.text(preguntaLines, 20, yPosition);
        yPosition += preguntaLines.length * 5 + 3;
        
        // Respuesta
        const respuesta = `Respuesta: ${interaction.respuesta}`;
        const respuestaLines = pdf.splitTextToSize(respuesta, 170);
        pdf.text(respuestaLines, 20, yPosition);
        yPosition += respuestaLines.length * 5 + 8;
      });
      
      // Guardar PDF
      pdf.save(`reporte-detallado-${className}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF detallado:', error);
      alert('Error al generar el reporte detallado');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">📊 Generador de Reportes</h3>
      <p className="text-gray-600 mb-6">
        Genera reportes en PDF con las estadísticas y actividad del chatbot.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Reporte Básico */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">📄 Reporte Básico</h4>
          <p className="text-sm text-gray-600 mb-4">
            Estadísticas generales y últimas 10 interacciones.
          </p>
          <button
            onClick={generateBasicPDF}
            disabled={isGenerating}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generando...' : 'Generar Reporte Básico'}
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
          <li>• <strong>Reporte Básico:</strong> Estadísticas principales y últimas interacciones</li>
          <li>• <strong>Reporte Detallado:</strong> Análisis completo con historial completo</li>
          <li>• Los reportes se descargan automáticamente en formato PDF</li>
          <li>• Incluye métricas de engagement y tendencias de uso</li>
        </ul>
      </div>
    </div>
  );
}