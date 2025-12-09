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
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas desde ahora
    index: { expires: 0 } // MongoDB eliminará automáticamente cuando expire
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Índice TTL para eliminación automática
preRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PreRegistrationModel = mongoose.models.PreRegistration || 
  mongoose.model('PreRegistration', preRegistrationSchema);