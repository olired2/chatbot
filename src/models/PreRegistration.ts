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
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas desde creación
    expires: 0 // MongoDB eliminará automáticamente cuando llegue a expiresAt
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export interface IPreRegistration {
  _id: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'Maestro' | 'Estudiante';
  institucion: string;
  codigoClase?: string;
  verificationToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export const PreRegistrationModel = mongoose.models.PreRegistration || mongoose.model<IPreRegistration>('PreRegistration', preRegistrationSchema);