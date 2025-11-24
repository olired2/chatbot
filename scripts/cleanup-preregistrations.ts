// Script para limpiar pre-registros expirados manualmente
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://manzooliver819_db_user:ol1v3r3102@cluster0.vqye7ir.mongodb.net/chatbot?retryWrites=true&w=majority&appName=Cluster0";

async function cleanupExpiredPreRegistrations() {
  try {
    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const PreRegistrationModel = mongoose.model('PreRegistration', new mongoose.Schema({
      nombre: String,
      email: String,
      password: String,
      rol: String,
      institucion: String,
      codigoClase: String,
      verificationToken: String,
      expiresAt: Date,
      createdAt: Date
    }));

    const now = new Date();
    
    // Contar registros expirados
    const expiredCount = await PreRegistrationModel.countDocuments({
      expiresAt: { $lt: now }
    });
    
    console.log(`🔍 Encontrados ${expiredCount} pre-registros expirados`);

    if (expiredCount > 0) {
      // Obtener lista de emails antes de eliminar
      const expiredEmails = await PreRegistrationModel.find(
        { expiresAt: { $lt: now } },
        { email: 1, createdAt: 1, expiresAt: 1 }
      );
      
      console.log('📧 Emails que serán eliminados:');
      expiredEmails.forEach(reg => {
        if (reg.createdAt && reg.expiresAt) {
          const age = Math.round((now.getTime() - reg.createdAt.getTime()) / (1000 * 60 * 60));
          console.log(`   - ${reg.email} (creado hace ${age}h, expiró: ${reg.expiresAt.toLocaleString()})`);
        }
      });

      // Eliminar registros expirados
      const deleteResult = await PreRegistrationModel.deleteMany({
        expiresAt: { $lt: now }
      });

      console.log(`🗑️  Eliminados ${deleteResult.deletedCount} pre-registros expirados`);
    }

    // Mostrar estadísticas actuales
    const totalRemaining = await PreRegistrationModel.countDocuments();
    console.log(`📊 Pre-registros activos restantes: ${totalRemaining}`);

    if (totalRemaining > 0) {
      const oldestActive = await PreRegistrationModel.findOne().sort({ createdAt: 1 });
      const newestActive = await PreRegistrationModel.findOne().sort({ createdAt: -1 });
      
      console.log('📈 Estadísticas de registros activos:');
      if (oldestActive?.createdAt) {
        console.log(`   - Más antiguo: ${oldestActive.createdAt.toLocaleString()} (${oldestActive?.email})`);
      }
      if (newestActive?.createdAt) {
        console.log(`   - Más reciente: ${newestActive.createdAt.toLocaleString()} (${newestActive?.email})`);
      }
      
      // Próximos a expirar (en las próximas 2 horas)
      const soonToExpire = await PreRegistrationModel.find({
        expiresAt: { 
          $gte: now,
          $lt: new Date(now.getTime() + 2 * 60 * 60 * 1000)
        }
      }, { email: 1, expiresAt: 1 });
      
      if (soonToExpire.length > 0) {
        console.log('⏰ Pre-registros que expirarán pronto:');
        soonToExpire.forEach(reg => {
          if (reg.expiresAt) {
            const hoursLeft = Math.round((reg.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
            console.log(`   - ${reg.email} (expira en ${hoursLeft}h)`);
          }
        });
      }
    }

    console.log('✨ Limpieza completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupExpiredPreRegistrations();