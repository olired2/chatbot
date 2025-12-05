import mongoose from 'mongoose';

const preRegistrationSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['Maestro', 'Estudiante'],
    required: true
  },
  institucion: {
    type: String,
    default: ''
  },
  codigoClase: {
    type: String,
    default: null
  },
  verificationToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 0 // Los documentos expirarán basándose en este campo
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // Desactivamos timestamps automáticos ya que manejamos createdAt manualmente
});

// Índice para la expiración automática
preRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PreRegistrationModel = mongoose.models.PreRegistration || 
  mongoose.model('PreRegistration', preRegistrationSchema);