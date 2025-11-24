// Validación centralizada de variables de entorno
import { logger } from './logger';

interface EnvironmentConfig {
  // Base
  NODE_ENV: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  
  // Database
  MONGODB_URI: string;
  MONGO_DBNAME?: string;
  
  // AI Services
  GOOGLE_API_KEY?: string;
  GROQ_API_KEY?: string;
  
  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_FROM?: string;
  
  // Security
  CRON_SECRET_TOKEN?: string;
}

class EnvironmentValidator {
  private config: EnvironmentConfig;
  
  constructor() {
    this.config = this.loadEnvironmentVariables();
    this.validateRequiredVariables();
    this.logEnvironmentStatus();
  }
  
  private loadEnvironmentVariables(): EnvironmentConfig {
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      MONGODB_URI: process.env.MONGODB_URI || '',
      MONGO_DBNAME: process.env.MONGO_DBNAME,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL_FROM: process.env.EMAIL_FROM,
      CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN
    };
  }
  
  private validateRequiredVariables(): void {
    const required = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'MONGODB_URI'
    ];
    
    const missing: string[] = [];
    
    for (const key of required) {
      if (!this.config[key as keyof EnvironmentConfig]) {
        missing.push(key);
      }
    }
    
    if (missing.length > 0) {
      const error = `Missing required environment variables: ${missing.join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }
  }
  
  private logEnvironmentStatus(): void {
    const isProduction = this.config.NODE_ENV === 'production';
    
    logger.info(`Environment: ${this.config.NODE_ENV}`);
    
    // Verificar características disponibles
    const features = {
      'Database': !!this.config.MONGODB_URI,
      'AI Chat (Google)': !!this.config.GOOGLE_API_KEY,
      'AI Chat (GROQ)': !!this.config.GROQ_API_KEY,
      'Email (SMTP)': !!(this.config.SMTP_USER && this.config.SMTP_PASS),
      'Email (Gmail)': !!(this.config.EMAIL_USER && this.config.EMAIL_PASS),
      'Cron Security': !!this.config.CRON_SECRET_TOKEN
    };
    
    for (const [feature, available] of Object.entries(features)) {
      if (available) {
        logger.info(`✅ ${feature} configurado`);
      } else if (isProduction) {
        logger.warn(`⚠️ ${feature} no configurado (puede afectar funcionalidad)`);
      } else {
        logger.debug(`ℹ️ ${feature} no configurado`);
      }
    }
    
    // Advertencias de seguridad
    if (isProduction) {
      if (this.config.NEXTAUTH_SECRET && this.config.NEXTAUTH_SECRET.length < 32) {
        logger.warn('NEXTAUTH_SECRET debería tener al menos 32 caracteres en producción');
      }
      
      if (!this.config.CRON_SECRET_TOKEN) {
        logger.warn('CRON_SECRET_TOKEN no configurado - endpoints de cron no están protegidos');
      }
    }
  }
  
  // Getters seguros
  get mongoUri(): string {
    return this.config.MONGODB_URI;
  }
  
  get mongoDb(): string {
    return this.config.MONGO_DBNAME || 'chatbot';
  }
  
  get nextAuthSecret(): string {
    return this.config.NEXTAUTH_SECRET;
  }
  
  get nextAuthUrl(): string {
    return this.config.NEXTAUTH_URL;
  }
  
  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }
  
  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
  
  // Helper para verificar si una funcionalidad está disponible
  hasFeature(feature: string): boolean {
    switch (feature) {
      case 'google-ai':
        return !!this.config.GOOGLE_API_KEY;
      case 'groq-ai':
        return !!this.config.GROQ_API_KEY;
      case 'email':
        return !!(this.config.SMTP_USER && this.config.SMTP_PASS) || 
               !!(this.config.EMAIL_USER && this.config.EMAIL_PASS);
      case 'cron-security':
        return !!this.config.CRON_SECRET_TOKEN;
      default:
        return false;
    }
  }
  
  // Getter seguro para variables de entorno sensibles
  getSecureEnvVar(key: keyof EnvironmentConfig): string | undefined {
    const value = this.config[key];
    
    // Log de acceso a variables sensibles (solo en desarrollo)
    if (this.isDevelopment && ['NEXTAUTH_SECRET', 'MONGODB_URI'].includes(key)) {
      logger.debug(`Accessing secure env var: ${key}`);
    }
    
    return value;
  }
}

// Singleton instance
export const env = new EnvironmentValidator();

// Helper functions
export function requireEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    const error = `Required environment variable ${key} is not defined`;
    logger.error(error);
    throw new Error(error);
  }
  return value;
}

export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}