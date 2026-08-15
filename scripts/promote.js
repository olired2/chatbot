const mongoose = require('mongoose');

async function promote() {
  try {
    await mongoose.connect('mongodb://localhost:27017/residencia');
    
    // Promover el usuario a Maestro
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateOne(
      { email: 'sebastianmontesolivera@gmail.com' },
      { $set: { rol: 'Maestro' } }
    );
    console.log('Promoted:', result.modifiedCount);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}

promote();
