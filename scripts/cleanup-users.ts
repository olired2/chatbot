// Script para limpiar campos duplicados en usuarios existentes
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://REDACTED_USER:REDACTED_PASSWORD@cluster0.vqye7ir.mongodb.net/chatbot?retryWrites=true&w=majority&appName=Cluster0";

async function cleanupUsers() {
  try {
    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Remover campos duplicados de todos los usuarios
    const result = await mongoose.connection.db?.collection('users').updateMany(
      {},
      { 
        $unset: { 
          name: "",    // Eliminar campo 'name'
          role: ""     // Eliminar campo 'role'
        } 
      }
    );

    console.log(`✅ Actualizado ${result.modifiedCount} usuarios`);
    console.log('✨ Limpieza completada');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupUsers();
