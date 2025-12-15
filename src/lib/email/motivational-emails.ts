import nodemailer from 'nodemailer';

// URL base para enlaces en plantillas (configurable)
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || 'https://chatbot-plum-eta-53.vercel.app';

// Configurar el transporter de nodemailer con validación
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER y/o EMAIL_PASS no están configuradas en el entorno');
  }

  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
};

// Plantillas de correo motivacional
const getMotivationalEmailTemplate = (studentName: string, className: string, daysInactive: number) => {
  const templates = [
    {
      subject: `¡Te extrañamos en ${className}! 🤖`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">¡Hola ${studentName}! 👋</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Tu mentor de IA te extraña</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              He notado que no has interactuado conmigo en los últimos <strong>${daysInactive} días</strong> en la clase de <strong>${className}</strong>. 
              ¡Me preocupa que te estés perdiendo de contenido valioso! 😊
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">🚀 ¿Sabías que puedo ayudarte con?</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li>Resolver dudas sobre cultura empresarial</li>
                <li>Explicar conceptos de emprendimiento</li>
                <li>Crear planes de negocio paso a paso</li>
                <li>Aplicar metodologías como SCAMPER y Design Thinking</li>
                <li>Analizar casos de empresas exitosas</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              <strong>💡 Tip del día:</strong> Una pregunta simple como "¿Qué es la misión de una empresa?" puede abrirte todo un mundo de posibilidades empresariales.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard/chat" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                💬 Volver al Chat
              </a>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⏰ Recuerda:</strong> La consistencia es clave en el aprendizaje. ¡Incluso 5 minutos al día pueden hacer la diferencia!
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">
              Este correo fue enviado automáticamente por tu mentor de IA 🤖<br>
              Si no deseas recibir estos recordatorios, contacta a tu profesor.
            </p>
          </div>
        </div>
      `
    },
    {
      subject: `${studentName}, ¡tu mentor de IA tiene consejos nuevos! 🎯`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">¡${studentName}! 🌟</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Es momento de continuar tu aprendizaje</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Han pasado <strong>${daysInactive} días</strong> desde nuestra última conversación en <strong>${className}</strong>. 
              ¡Tengo muchos insights nuevos que compartir contigo! 🚀
            </p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin: 0 0 15px 0;">💼 Tendencias Empresariales Actuales</h3>
              <p style="color: #047857; margin: 0; font-size: 14px;">
                ¿Sabías que las empresas más exitosas de 2024 implementan metodologías ágiles y pensamiento de diseño? 
                ¡Pregúntame sobre casos específicos!
              </p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
              <div style="background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 5px;">🎯</div>
                <div style="font-size: 14px; color: #1e40af; font-weight: bold;">Objetivos SMART</div>
              </div>
              <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 5px;">💡</div>
                <div style="font-size: 14px; color: #1e40af; font-weight: bold;">Innovación</div>
              </div>
            </div>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              <strong>🔥 Pregunta del día:</strong> "¿Cómo puede una startup competir contra grandes empresas?" 
              ¡La respuesta te sorprenderá!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard/chat" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Hacer Pregunta
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">
              Tu mentor de IA siempre está aquí para apoyarte 💪<br>
              Clase: ${className}
            </p>
          </div>
        </div>
      `
    }
  ];

  // Reemplazar enlaces localhost por la URL de despliegue
  templates.forEach(t => {
    t.html = t.html.replace(/http:\/\/localhost:3000/g, BASE_URL);
  });

  // Elegir plantilla aleatoria
  return templates[Math.floor(Math.random() * templates.length)];
};

// Función para enviar correo motivacional
export async function sendMotivationalEmail(
  studentEmail: string, 
  studentName: string, 
  className: string, 
  daysInactive: number
) {
  const maxAttempts = 3;
  const fromAddress = process.env.EMAIL_FROM || 'chatbot@residencia.edu';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const transporter = createTransporter();
      const template = getMotivationalEmailTemplate(studentName, className, daysInactive);

      const mailOptions = {
        from: `"🤖 Mentor de IA" <${fromAddress}>`,
        to: studentEmail,
        subject: template.subject,
        html: template.html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Correo motivacional enviado a ${studentName} (${studentEmail}) [attempt ${attempt}]`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error enviando correo a ${studentEmail} (attempt ${attempt}):`, errMsg);

      // Si fue el último intento devolver el error
      if (attempt === maxAttempts) {
        return { success: false, error: errMsg };
      }

      // Espera exponencial antes del siguiente intento
      const backoffMs = 500 * Math.pow(2, attempt - 1);
      await new Promise(res => setTimeout(res, backoffMs));
    }
  }

  return { success: false, error: 'No se pudo enviar el correo después de varios intentos' };
}

// Función para verificar configuración de correo
export async function testEmailConfiguration() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Configuración de correo válida');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en configuración de correo:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}