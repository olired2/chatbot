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
<<<<<<< HEAD
    enum: ['Maestro', 'Estudiante'],
=======
    enum: ['Maestro', 'Estudiante', 'Administrador'],
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
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
<<<<<<< HEAD
=======
  },
  lastActive: {
    type: Date,
    default: Date.now
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
  }
}, {
  timestamps: true
});

<<<<<<< HEAD
// Hash password before saving - temporarily disabled
/*userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await hash(this.password, 10);
  next();
});*/
=======
// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  // Evitar doble encriptación si la contraseña ya es un hash de bcrypt
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }
  
  this.password = await hash(this.password, 10);
  next();
});
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8

export interface IUser {
  _id: string;
  nombre: string;
  email: string;
  password: string;
<<<<<<< HEAD
  rol: 'Maestro' | 'Estudiante';
=======
  rol: 'Maestro' | 'Estudiante' | 'Administrador';
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
  institucion: string;
  classes: string[];
  registeredAt: Date;
  emailVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
<<<<<<< HEAD
=======
  lastActive?: Date;
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
}

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);