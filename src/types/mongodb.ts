import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  nombre: string;
  email: string;
  password: string;
  rol: 'Maestro' | 'Estudiante';
  institucion?: string;
  classes: ObjectId[];
  fecha_registro: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  name: string;
  path: string;
  type: 'pdf' | 'doc' | 'docx';
  size: number;
  uploadedAt: Date;
  embeddings: boolean;
  processedAt?: Date;
  errorCount: number;
  lastError?: string;
}

export interface Class {
  _id: ObjectId;
  name: string;
  description: string;
  code: string;
  teacher: ObjectId;
  students: ObjectId[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  _id: ObjectId;
  classId: ObjectId;
  userId: ObjectId;
  content: string;
  context: string[];
  type: 'question' | 'answer';
  createdAt: Date;
}