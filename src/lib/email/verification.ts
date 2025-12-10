import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'tu_email@gmail.com',
    pass: process.env.SMTP_PASS || 'tu_app_password'
  }
});

// Generar token de verificación
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Enviar email de verificación
export async function sendVerificationEmail(
  email: string, 
  nombre: string, 
  token: string
): Promise<boolean> {
  try {
    // URL de producción o desarrollo
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://chatbot-plum-eta-53.vercel.app' 
      : 'http://localhost:3000';
    
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"MentorBot" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '📧 Verificar tu cuenta en MentorBot',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verificación de Email</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 30px 20px; text-align: center; }
            .logo { width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            .content { padding: 30px 20px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🤖</div>
              <h1 style="color: white; margin: 0; font-size: 24px;">¡Bienvenido a MentorBot!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Tu asistente inteligente para el aprendizaje</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Hola ${nombre},</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                ¡Gracias por registrarte en MentorBot! Para completar tu registro y comenzar a conversar con MentorBot, necesitas verificar tu dirección de correo electrónico.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Haz clic en el botón de abajo para verificar tu cuenta:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">
                  ✅ Verificar mi cuenta
                </a>
              </div>
              
              <div class="warning">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⏰ Este enlace expira en 24 horas.</strong> Si no verificas tu cuenta dentro de este tiempo, deberás registrarte nuevamente.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">
                  ${verificationUrl}
                </code>
              </p>
              
              <p style="color: #6b7280; font-size: 14px;">
                Si no te registraste en MentorBot, puedes ignorar este email con seguridad.
              </p>
            </div>
            
            <div class="footer">
              <p>© 2025 MentorBot - Educación Inteligente</p>
              <p>Este es un email automático, no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de verificación enviado a: ${email}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    return false;
  }
}

// Enviar email de recuperación de contraseña
export async function sendPasswordResetEmail(
  email: string, 
  nombre: string, 
  resetUrl: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"MentorBot" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔑 Recuperar tu contraseña de MentorBot',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperación de Contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #ef4444, #f97316); padding: 30px 20px; text-align: center; }
            .logo { width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            .content { padding: 30px 20px; }
            .button { display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔑</div>
              <h1 style="color: white; margin: 0; font-size: 24px;">Recuperación de Contraseña</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Restablece tu acceso a MentorBot</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Hola ${nombre},</h2>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta de MentorBot. Si no fuiste tú quien solicitó esto, puedes ignorar este email con seguridad.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6;">
                Para crear una nueva contraseña, haz clic en el botón de abajo:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">
                  🔐 Restablecer Contraseña
                </a>
              </div>
              
              <div class="warning">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>⏰ Este enlace expira en 1 hora.</strong> Por seguridad, deberás solicitar un nuevo enlace si no lo usas dentro de este tiempo.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">
                  ${resetUrl}
                </code>
              </p>
              
              <p style="color: #6b7280; font-size: 14px;">
                Si no solicitaste este cambio de contraseña, tu cuenta sigue siendo segura y puedes ignorar este email.
              </p>
            </div>
            
            <div class="footer">
              <p>© 2025 MentorBot - Educación Inteligente</p>
              <p>Este es un email automático, no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a: ${email}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    return false;
  }
}

// Verificar token de verificación
export function isTokenValid(expiresAt: Date): boolean {
  return new Date() < expiresAt;
}