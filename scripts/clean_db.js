const mongoose = require('mongoose');

async function cleanDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mentorbot');
    console.log('Conectado a MongoDB local.');
    
    // Limpiar DocumentChunks
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      if (collection.collectionName === 'documentchunks') {
        await collection.deleteMany({});
        console.log('✅ Base de datos de vectores (DocumentChunks) purgada exitosamente.');
      }
    }
  } catch (error) {
    console.error('Error purgando DB:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanDB();
