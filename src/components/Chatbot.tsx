'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  classes: Array<{
    _id: string;
    name: string;
    description: string;
    documents: Array<{
      name: string;
      uploadedAt: string | null;
    }>;
    teacher: {
      nombre: string;
      email: string;
    };
  }>;
}

export default function Chatbot({ classes }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?._id || '');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedClassData = classes.find(c => c._id === selectedClass);

  // Auto-scroll al final cuando cambien los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cargar historial cuando se monta el componente o cambia la clase
  useEffect(() => {
    if (selectedClass) {
      loadChatHistory();
    }
  }, [selectedClass]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`/api/classes/${selectedClass}/chat/history`);
      
      if (!response.ok) {
        throw new Error('Error al cargar historial');
      }

      const data = await response.json();
      
      // Convertir el historial a formato de mensajes
      const historyMessages: Message[] = data.interactions.flatMap((interaction: any) => [
        {
          role: 'user' as const,
          content: interaction.question,
          timestamp: new Date(interaction.timestamp)
        },
        {
          role: 'assistant' as const,
          content: interaction.answer,
          timestamp: new Date(interaction.timestamp)
        }
      ]);

      setMessages(historyMessages);
    } catch (err) {
      console.error('Error cargando historial:', err);
      // No mostrar error al usuario, simplemente empezar con chat vacío
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/classes/${selectedClass}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener respuesta');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      const errorMsg: Message = {
        role: 'assistant',
        content: `Lo siento, ocurrió un error: ${errorMessage}. Por favor intenta de nuevo.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header con selección de clase */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base sm:text-lg font-semibold">🤖 MentorBot</h2>
          {messages.length > 0 && (
            <button
              onClick={loadChatHistory}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded transition-colors"
              title="Recargar historial"
            >
              🔄 <span className="hidden sm:inline">Recargar</span>
            </button>
          )}
        </div>
        {classes.length > 1 ? (
          <div>
            <label className="block text-sm mb-2 opacity-90">
              Selecciona una clase:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setError('');
              }}
              className="w-full p-2 rounded text-gray-900 text-sm"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.teacher.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-sm opacity-90">
            <p>{selectedClassData?.name}</p>
            <p className="text-xs">Profesor: {selectedClassData?.teacher.nombre}</p>
          </div>
        )}
      </div>

      {/* Información de documentos */}
      {selectedClassData && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
          <p className="text-xs text-blue-800">
            📚 {selectedClassData.documents?.length || 0} documento(s) disponible(s) para consulta
          </p>
        </div>
      )}

      {/* Área de mensajes */}
      <div className="h-64 sm:h-96 p-3 sm:p-4 overflow-y-auto bg-gray-50">
        {loadingHistory ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm">Cargando historial...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm font-medium">¡Hola! Soy MentorBot</p>
            <p className="text-xs mt-2">
              Dale una instrucción sobre el contenido de la clase
            </p>
          </div>
        ) : (
          messages.map((message, i) => (
            <div
              key={i}
              className={`mb-4 flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    skipHtml={false}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      code: ({node, ...props}: any) => 
                        props.inline ? (
                          <code className="bg-gray-200 px-1 rounded text-xs" {...props} />
                        ) : (
                          <code className="block bg-gray-200 p-2 rounded mb-2 text-xs overflow-x-auto" {...props} />
                        ),
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-indigo-200'
                      : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t bg-white">
        {error && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dale una instrucción a MentorBot..."
            disabled={loading}
            className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 placeholder-gray-500 text-gray-900 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base min-w-[60px] sm:min-w-auto"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span className="hidden sm:inline">Enviar</span>
                <span className="sm:hidden">📤</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Las respuestas se basan en los documentos compartidos por tu profesor
        </p>
      </form>
    </div>
  );
}