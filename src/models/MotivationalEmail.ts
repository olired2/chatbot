import { Schema, model, models, Document, Types } from 'mongoose';

export interface IMotivationalEmail extends Document {
  usuario_id: string;
  clase_id: string;
  tipo_correo: 'inactividad_15_dias' | 'recordatorio_semanal' | 'bienvenida';
  fecha_envio: Date;
  email_enviado_a: string;
  dias_inactividad: number;
  template_usado: string;
  estado: 'enviado' | 'fallido' | 'pendiente';
  mensaje_error?: string;
}

const MotivationalEmailSchema = new Schema<IMotivationalEmail>({
  usuario_id: {
    type: String,
    required: true,
    index: true
  },
  clase_id: {
    type: String,
    required: true,
    index: true
  },
  tipo_correo: {
    type: String,
    enum: ['inactividad_15_dias', 'recordatorio_semanal', 'bienvenida'],
    required: true
  },
  fecha_envio: {
    type: Date,
    default: Date.now,
    index: true
  },
  email_enviado_a: {
    type: String,
    required: true
  },
  dias_inactividad: {
    type: Number,
    required: true
  },
  template_usado: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['enviado', 'fallido', 'pendiente'],
    default: 'pendiente'
  },
  mensaje_error: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Índices compuestos para queries eficientes
MotivationalEmailSchema.index({ usuario_id: 1, clase_id: 1, tipo_correo: 1 });
MotivationalEmailSchema.index({ fecha_envio: -1 });

export const MotivationalEmailModel = models.MotivationalEmail || model<IMotivationalEmail>('MotivationalEmail', MotivationalEmailSchema);