'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface EmailStats {
  success: boolean;
  totalEmails: number;
  stats: Array<{
    _id: string;
    count: number;
    ultimoEnvio: string;
  }>;
  recentEmails: Array<{
    _id: string;
    email_enviado_a: string;
    dias_inactividad: number;
    fecha_envio: string;
    estado: string;
    tipo_correo: string;
  }>;
}

interface StudentActivity {
  studentId: string;
  studentName: string;
  studentEmail: string;
  classId: string;
  className: string;
  daysInactive: number;
  lastInteractionDate: string | null;
}

export default function MotivationalEmailManager() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [studentsActivity, setStudentsActivity] = useState<StudentActivity[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [sendingToStudent, setSendingToStudent] = useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedStudentsToEmail, setSelectedStudentsToEmail] = useState<string[]>([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Cargar estadísticas
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/motivational-emails');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ejecutar proceso de correos motivacionales
  const runEmailProcess = async () => {
    setIsSending(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/motivational-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        await loadStats(); // Recargar estadísticas
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Error conectando con el servidor');
      console.error('Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Cargar actividad de los estudiantes
  const loadStudentsActivity = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await fetch('/api/motivational-emails/students');
      if (response.ok) {
        const data = await response.json();
        setStudentsActivity(data.students || []);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Enviar correo a estudiante específico
  const sendEmailToStudent = async (studentId: string, classId: string) => {
    setSendingToStudent(studentId);
    try {
      const response = await fetch('/api/motivational-emails/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, classId })
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Correo enviado exitosamente a ese estudiante.`);
        await loadStats();
      } else {
        setMessage(`❌ Error al enviar correo: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Error conectando con el servidor');
    } finally {
      setSendingToStudent(null);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentsToEmail(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudentsToEmail.length === studentsActivity.length) {
      setSelectedStudentsToEmail([]);
    } else {
      setSelectedStudentsToEmail(studentsActivity.map(s => s.studentId));
    }
  };

  const sendEmailsToSelectedStudents = async () => {
    if (selectedStudentsToEmail.length === 0) return;
    
    setIsSendingBulk(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      const promises = selectedStudentsToEmail.map(async (studentId) => {
        const student = studentsActivity.find(s => s.studentId === studentId);
        if (!student) return;
        
        try {
          const response = await fetch('/api/motivational-emails/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: student.studentId, classId: student.classId })
          });
          const result = await response.json();
          if (result.success) successCount++;
          else failCount++;
        } catch (e) {
          failCount++;
        }
      });
      
      await Promise.all(promises);
      
      setMessage(`✅ Se enviaron ${successCount} correos exitosamente.` + (failCount > 0 ? ` (Fallaron ${failCount})` : ''));
      setSelectedStudentsToEmail([]);
      await loadStats();
    } catch (error) {
      setMessage('❌ Error en el proceso de envío masivo');
    } finally {
      setIsSendingBulk(false);
    }
  };

  const toggleEmailSelection = (id: string) => {
    setSelectedEmails(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectAllEmails = () => {
    if (!stats || stats.recentEmails.length === 0) return;
    if (selectedEmails.length === stats.recentEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(stats.recentEmails.map(e => e._id));
    }
  };

  const deleteSelectedEmails = async () => {
    if (selectedEmails.length === 0) return;
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedEmails.length} correos?`)) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/motivational-emails/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedEmails })
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        setSelectedEmails([]);
        await loadStats();
      } else {
        setMessage(`❌ Error al eliminar: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Error conectando con el servidor al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'Maestro') {
      loadStats();
      loadStudentsActivity();
    }
  }, [session]);

  if (session?.user?.role !== 'Maestro') {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2">📧 Correos Motivacionales Automáticos</h3>
      <p className="text-gray-600 mb-6">
        El sistema envía automáticamente cada mañana a las 9:00 AM correos motivacionales a estudiantes que no han interactuado por 15 días o más.
      </p>

      {/* Controles principales */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">⏰ Ejecución automática:</span> Diaria a las 9:00 AM
        </p>
        <button
          onClick={runEmailProcess}
          disabled={isSending}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Escaneando y Enviando...
            </>
          ) : (
            '🚀 Escanear y Enviar Manualmente'
          )}
        </button>
      </div>

      {/* Mensaje de resultado */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Estadísticas y Correos Recientes */}
      {stats && (
        <div className="space-y-6">
          {/* Total de correos */}
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <span className="font-semibold text-green-800">Correos enviados:</span>
            <span className="text-2xl font-bold text-green-600">{stats.totalEmails}</span>
          </div>

          {/* Correos recientes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">📋 Correos Enviados Recientemente</h4>
              {stats.recentEmails.length > 0 && (
                <div className="flex gap-2">
                  <button 
                    onClick={selectAllEmails}
                    className="text-sm px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    {selectedEmails.length === stats.recentEmails.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </button>
                  {selectedEmails.length > 0 && (
                    <button 
                      onClick={deleteSelectedEmails}
                      disabled={isDeleting}
                      className="text-sm px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition flex items-center gap-1"
                    >
                      {isDeleting ? 'Eliminando...' : `🗑️ Eliminar (${selectedEmails.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {stats.recentEmails.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {stats.recentEmails.map((email) => (
                    <div key={email._id} className="p-4 hover:bg-gray-50 transition flex items-start gap-3">
                      <div className="mt-1">
                        <input 
                          type="checkbox" 
                          checked={selectedEmails.includes(email._id)}
                          onChange={() => toggleEmailSelection(email._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{email.email_enviado_a}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Enviado hace: {new Date(email.fecha_envio).toLocaleDateString('es-MX', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                            email.estado === 'enviado' ? 'bg-green-100 text-green-800' :
                            email.estado === 'fallido' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {email.estado === 'enviado' ? '✅ Enviado' :
                             email.estado === 'fallido' ? '❌ Fallido' :
                             '⏳ Pendiente'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 flex gap-4">
                          <span>📧 {email.tipo_correo === 'inactividad_15_dias' ? 'Inactividad (15 días)' : email.tipo_correo}</span>
                          <span>⏰ {email.dias_inactividad} días sin interacción</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-600">No hay correos enviados aún</p>
                  <p className="text-gray-400 text-sm mt-1">Los correos aparecerán aquí una vez que se envíen</p>
                </div>
              )}
            </div>
          </div>
          {/* Sección de Selección Manual */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">🎯 Selección Manual por Estudiante</h4>
              {studentsActivity.length > 0 && (
                <div className="flex gap-2">
                  <button 
                    onClick={selectAllStudents}
                    className="text-sm px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    {selectedStudentsToEmail.length === studentsActivity.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </button>
                  {selectedStudentsToEmail.length > 0 && (
                    <button 
                      onClick={sendEmailsToSelectedStudents}
                      disabled={isSendingBulk}
                      className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                    >
                      {isSendingBulk ? 'Enviando...' : `🚀 Enviar a Seleccionados (${selectedStudentsToEmail.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {isLoadingStudents ? (
                <div className="p-8 text-center text-gray-500">Cargando estudiantes...</div>
              ) : studentsActivity.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {studentsActivity.map((student) => {
                    const isInactive = student.daysInactive >= 15;
                    return (
                      <div 
                        key={`${student.studentId}-${student.classId}`} 
                        className="p-4 transition flex items-center justify-between"
                        style={{ 
                          backgroundColor: isInactive ? '#fef2f2' : '#f0fdf4',
                          borderLeft: `4px solid ${isInactive ? '#ef4444' : '#22c55e'}`
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <input 
                            type="checkbox"
                            checked={selectedStudentsToEmail.includes(student.studentId)}
                            onChange={() => toggleStudentSelection(student.studentId)}
                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold" style={{ color: isInactive ? '#991b1b' : '#166534' }}>
                              {student.studentName}
                            </div>
                            <div className="text-sm" style={{ color: isInactive ? '#b91c1c' : '#15803d' }}>
                              {student.studentEmail} • Clase: {student.className}
                            </div>
                            <div 
                              className="text-sm mt-1 font-black" 
                              style={{ color: isInactive ? '#dc2626' : '#16a34a' }}
                            >
                              ⚠️ Inactivo por {student.daysInactive} días
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => sendEmailToStudent(student.studentId, student.classId)}
                          disabled={sendingToStudent === student.studentId}
                          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white shadow-sm disabled:opacity-50"
                          style={{ backgroundColor: isInactive ? '#dc2626' : '#2563eb' }}
                        >
                          {sendingToStudent === student.studentId ? 'Enviando...' : 'Enviar Correo Manual'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No hay estudiantes en tus clases.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}