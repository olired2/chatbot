import { NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import connectDB from '@/lib/db/mongodb';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email/verification';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar usuario por email
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    // Siempre retornar éxito por seguridad (no revelar si el email existe)
    if (!user) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación' 
        },
        { status: 200 }
      );
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Expira en 1 hora

    // Guardar token en el usuario
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Enviar email de recuperación
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (emailError) {
      console.error('Error enviando email de recuperación:', emailError);
      
      // Limpiar token si falló el envío
      user.passwordResetToken = undefined;
      user.passwordResetExpiry = undefined;
      await user.save();

      return NextResponse.json(
        { error: 'Error enviando el email de recuperación. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}