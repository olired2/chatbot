import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clase_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  pregunta: {
    type: String,
    required: true
  },
  respuesta: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  sources: [{
    type: String
  }]
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por usuario y fecha
interactionSchema.index({ usuario_id: 1, fecha: -1 });
interactionSchema.index({ clase_id: 1, fecha: -1 });

export const InteractionModel = mongoose.models.Interaction || mongoose.model('Interaction', interactionSchema);
