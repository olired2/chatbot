import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Campos de expiración
  duration: {
    type: Number, // duración en días
    min: 1,
    max: 365
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index para eliminación automática
  },
  durationType: {
    type: String,
    enum: ['days', 'specific-date'],
    default: 'days'
  },
  documents: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    name: String,
    path: String,
    type: {
      type: String,
      enum: ['pdf', 'doc', 'docx'],
      default: 'pdf'
    },
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    processed: {
      type: Boolean,
      default: false
    },
    embeddings: {
      type: Boolean,
      default: false
    },
    processedAt: Date,
    errorCount: {
      type: Number,
      default: 0
    },
    lastError: String
  }]
}, {
  timestamps: true
});

export const ClassModel = mongoose.models.Class || mongoose.model('Class', classSchema);