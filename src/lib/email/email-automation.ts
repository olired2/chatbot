import { InteractionModel } from '@/models/Interaction';
import { ClassModel } from '@/models/Class';
import { UserModel } from '@/models/User';
import { MotivationalEmailModel } from '@/models/MotivationalEmail';
import { sendMotivationalEmail } from './motivational-emails';
import connectDB from '@/lib/db/mongodb';

// Constantes de configuración
const INACTIVITY_THRESHOLD_DAYS = 15;
const EMAIL_COOLDOWN_DAYS = 7; // No enviar otro correo hasta después de 7 días

// Función para calcular días de diferencia
function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay);
}

// Función principal para verificar y enviar correos motivacionales
export async function checkAndSendMotivationalEmails() {
  try {
    await connectDB();
    
    console.log('🔍 Verificando estudiantes inactivos...');
    
    // Obtener todas las clases activas
    const classes = await ClassModel.find({}).populate('students', 'nombre email _id');
    
    let totalEmailsSent = 0;
    let totalStudentsChecked = 0;

    for (const classDoc of classes) {
      console.log(`📚 Verificando clase: ${classDoc.name}`);
      
      if (!classDoc.students || classDoc.students.length === 0) {
        console.log(`   ⚠️ No hay estudiantes en la clase ${classDoc.name}`);
        continue;
      }

      for (const student of classDoc.students) {
        totalStudentsChecked++;
        
        try {
          // Buscar la última interacción del estudiante en esta clase
          const lastInteraction = await InteractionModel.findOne({
            usuario_id: student._id,
            clase_id: classDoc._id
          }).sort({ fecha: -1 });

          const now = new Date();
          let daysInactive = 0;
          let shouldSendEmail = false;

          if (!lastInteraction) {
            // El estudiante nunca ha interactuado
            // Verificar cuándo se inscribió a la clase
            daysInactive = getDaysDifference(classDoc.createdAt, now);
            shouldSendEmail = daysInactive >= INACTIVITY_THRESHOLD_DAYS;
          } else {
            // El estudiante ha interactuado antes
            daysInactive = getDaysDifference(lastInteraction.fecha, now);
            shouldSendEmail = daysInactive >= INACTIVITY_THRESHOLD_DAYS;
          }

          if (!shouldSendEmail) {
            continue; // Estudiante activo, continuar con el siguiente
          }

          // Verificar si ya se envió un correo recientemente
          const recentEmail = await MotivationalEmailModel.findOne({
            usuario_id: student._id,
            clase_id: classDoc._id,
            tipo_correo: 'inactividad_15_dias',
            fecha_envio: {
              $gte: new Date(now.getTime() - (EMAIL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000))
            }
          });

          if (recentEmail) {
            console.log(`   ⏭️ Ya se envió correo reciente a ${student.nombre}`);
            continue;
          }

          console.log(`   📧 Enviando correo motivacional a ${student.nombre} (${daysInactive} días inactivo)`);

          // Crear registro del correo antes de enviarlo
          const emailRecord = new MotivationalEmailModel({
            usuario_id: student._id,
            clase_id: classDoc._id,
            tipo_correo: 'inactividad_15_dias',
            email_enviado_a: student.email,
            dias_inactividad: daysInactive,
            template_usado: 'motivacional_inactividad',
            estado: 'pendiente'
          });

          // Enviar el correo
          const emailResult = await sendMotivationalEmail(
            student.email,
            student.nombre,
            classDoc.name,
            daysInactive
          );

          // Actualizar el registro con el resultado
          if (emailResult.success) {
            emailRecord.estado = 'enviado';
            totalEmailsSent++;
            console.log(`   ✅ Correo enviado exitosamente a ${student.nombre}`);
          } else {
            emailRecord.estado = 'fallido';
            emailRecord.mensaje_error = emailResult.error;
            console.log(`   ❌ Error enviando correo a ${student.nombre}: ${emailResult.error}`);
          }

          await emailRecord.save();

        } catch (studentError) {
          console.error(`   ❌ Error procesando estudiante ${student.nombre}:`, studentError);
        }
      }
    }

    console.log(`✅ Proceso completado:`);
    console.log(`   📊 Estudiantes verificados: ${totalStudentsChecked}`);
    console.log(`   📧 Correos enviados: ${totalEmailsSent}`);

    return {
      success: true,
      studentsChecked: totalStudentsChecked,
      emailsSent: totalEmailsSent
    };

  } catch (error) {
    console.error('❌ Error en proceso de correos motivacionales:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para obtener estadísticas de correos motivacionales
export async function getMotivationalEmailStats(classId?: string) {
  try {
    await connectDB();
    
    const filter = classId ? { clase_id: classId } : {};
    
    const stats = await MotivationalEmailModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 },
          ultimoEnvio: { $max: '$fecha_envio' }
        }
      }
    ]);

    const totalEmails = await MotivationalEmailModel.countDocuments(filter);
    
    const recentEmails = await MotivationalEmailModel.find(filter)
      .populate({
        path: 'usuario_id',
        select: 'nombre email',
        model: 'User'
      })
      .populate({
        path: 'clase_id', 
        select: 'name',
        model: 'Class'
      })
      .sort({ fecha_envio: -1 })
      .limit(10);

    return {
      success: true,
      totalEmails,
      stats,
      recentEmails
    };
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de correos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para ejecutar el proceso manualmente (para testing)
export async function runMotivationalEmailsManually() {
  console.log('🚀 Ejecutando proceso manual de correos motivacionales...');
  return await checkAndSendMotivationalEmails();
}