// Sistema de logging centralizado
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  classId?: string;
  feature?: string;
  ip?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, context);
    if (this.isDevelopment) {
      console.log(`ℹ️ ${formatted}`);
    }
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(`⚠️ ${formatted}`);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorDetails = error ? ` - ${error.message}${error.stack ? `\n${error.stack}` : ''}` : '';
    const formatted = this.formatMessage('error', message + errorDetails, context);
    console.error(`❌ ${formatted}`);
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context);
      console.log(`🐛 ${formatted}`);
    }
  }

  // Método especial para logs de AI/Chat
  aiChat(message: string, context: { classId?: string; userId?: string; queryLength?: number }): void {
    if (this.isDevelopment) {
      this.info(`🤖 Chat AI: ${message}`, context);
    }
  }

  // Método especial para logs de seguridad
  security(message: string, context: { userId?: string; ip?: string; action?: string }): void {
    this.warn(`🔒 Security: ${message}`, context);
  }

  // Método especial para logs de rendimiento
  performance(message: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      this.info(`⚡ Performance: ${message} (${duration}ms)`, context);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Helper para medir tiempo de ejecución
export function measureTime<T>(fn: () => Promise<T>, label: string, context?: LogContext): Promise<T> {
  const start = Date.now();
  return fn().finally(() => {
    const duration = Date.now() - start;
    logger.performance(label, duration, context);
  });
}

// Helper para logging de errores en APIs
export function logApiError(error: unknown, endpoint: string, context?: LogContext): void {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  logger.error(`API Error en ${endpoint}: ${errorMessage}`, error instanceof Error ? error : undefined, context);
}

// Helper para logging de autenticación
export function logAuthEvent(event: string, userId?: string, ip?: string): void {
  logger.security(`Auth event: ${event}`, { userId, ip, action: event });
}