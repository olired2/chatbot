import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  documentId: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true }
});

// Indexes for fast querying
documentChunkSchema.index({ classId: 1, documentId: 1 });

export const DocumentChunkModel = mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', documentChunkSchema);
