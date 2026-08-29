// Promueve un usuario a un rol dado.
// Uso: node scripts/promote.js <email> [rol]
// rol por defecto: Maestro. MONGODB_URI por defecto: mongodb://localhost:27017/residencia

const mongoose = require('mongoose');

const email = process.argv[2];
const rol = process.argv[3] || 'Maestro';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/residencia';

if (!email) {
  console.error('Uso: node scripts/promote.js <email> [rol]');
  process.exit(1);
}

async function promote() {
  try {
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection.db;
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { rol } }
    );
    console.log(`Promoted (${email} -> ${rol}):`, result.modifiedCount);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
}

promote();
