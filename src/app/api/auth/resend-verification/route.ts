import { NextRequest, NextResponse } from 'next/server';
import { PreRegistrationModel } from '@/models/PreRegistration';
import { UserModel } from '@/models/User';
import connectDB from '@/lib/db/mongodb';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email/verification';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar si ya existe un usuario registrado
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Esta cuenta ya está registrada y verificada. Puedes iniciar sesión.' },
        { status: 400 }
      );
    }

    // Buscar pre-registro existente
    const preRegistration = await PreRegistrationModel.findOne({ email });
    if (!preRegistration) {
      return NextResponse.json(
        { message: 'No se encontró ningún registro pendiente para este email.' },
        { status: 404 }
      );
    }

    // Verificar si el pre-registro actual ha expirado
    const now = new Date();
    if (preRegistration.expiresAt && preRegistration.expiresAt < now) {
      // Eliminar el pre-registro expirado
      await PreRegistrationModel.findByIdAndDelete(preRegistration._id);
      return NextResponse.json(
        { message: 'El registro anterior ha expirado. Por favor, registrate nuevamente desde el inicio.' },
        { status: 400 }
      );
    }

    // Generar nuevo token
    const newToken = generateVerificationToken();
    
    // Actualizar el pre-registro con nuevo token y extender expiración por 24 horas más
    await PreRegistrationModel.findByIdAndUpdate(preRegistration._id, {
      verificationToken: newToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // +24 horas desde ahora
    });

    // Enviar nuevo email
    const emailSent = await sendVerificationEmail(email, preRegistration.nombre, newToken);
    
    if (!emailSent) {
      return NextResponse.json(
        { message: 'Error enviando email. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    console.log(`🔄 Email de verificación reenviado a: ${email}`);

    return NextResponse.json(
      { 
        message: 'Email de verificación reenviado exitosamente. Por favor revisa tu correo.',
        sent: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error reenviando email:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}