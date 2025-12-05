import mongoose from 'mongoose';
import { hash } from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  registeredAt: {
    type: Date,
    default: Date.now
  },
  emailVerified: {
    type: Boolean,
    default: true // Siempre true porque solo se crea después de verificar
  },
  passwordResetToken: {
    type: String,
    default: undefined
  },
  passwordResetExpiry: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true
});

// Hash password before saving - temporarily disabled
/*userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await hash(this.password, 10);
  next();
});*/

export interface IUser {
  _id: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'Maestro' | 'Estudiante';
  institucion: string;
  classes: string[];
  registeredAt: Date;
  emailVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
}

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);