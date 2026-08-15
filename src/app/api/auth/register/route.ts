
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { UserModel } from '@/models/User';
import { ClassModel } from '@/models/Class';
import { PreRegistrationModel } from '@/models/PreRegistration';
import connectDB from '@/lib/db/mongodb';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email/verification';

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password, institucion, codigoClase } = await req.json();

    if (!nombre || !email || !password || !institucion) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar si el email ya está registrado o en pre-registro
    const existingUser = await UserModel.findOne({ email });
    const existingPreRegistration = await PreRegistrationModel.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    if (existingPreRegistration) {
      return NextResponse.json(
        { message: 'Ya hay un registro pendiente para este email. Por favor revisa tu correo.' },
        { status: 400 }
      );
    }

    // Si se proporcionó un código de clase, verificar que existe
    let classToJoin = null;
    if (codigoClase) {
      classToJoin = await ClassModel.findOne({ code: codigoClase.toUpperCase() });
      if (!classToJoin) {
        return NextResponse.json(
          { message: 'El código de clase no es válido' },
          { status: 400 }
        );
      }
    }

    // Validar código de maestro (REMOVED)
    // El rol por defecto siempre será 'Estudiante'
    const finalRole = 'Estudiante';

    // Generar token de verificación
    const verificationToken = generateVerificationToken();

    // Crear PRE-REGISTRO (no usuario real aún)
    const preRegistration = await PreRegistrationModel.create({
      nombre,
      email,
      password: await hash(password, 10), // Hash la contraseña ahora
      rol: finalRole,
      institucion,
      codigoClase: codigoClase || null,
      verificationToken
    });

    // Enviar email de verificación
    const emailSent = await sendVerificationEmail(email, nombre, verificationToken).catch(() => false);
    
    // BYPASS PARA DESARROLLO LOCAL
    console.log(`\n\n=== ENLACE DE VERIFICACIÓN LOCAL ===\nhttp://localhost:3000/api/auth/verify-email?token=${verificationToken}\n=====================================\n\n`);
    
    // Check if SMTP is configured, if not we will just skip the failure so the user can verify via local log or auto-verify
    const hasSmtpConfigured = !!process.env.SMTP_USER;
    
    if (!emailSent && hasSmtpConfigured) {
      // Solo fallar y borrar si realmente esperamos que el correo funcione
      await PreRegistrationModel.findByIdAndDelete(preRegistration._id);
      return NextResponse.json(
        { message: 'Error enviando email de verificación. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    console.log(`📝 Pre-registro creado para: ${email}`);

    return NextResponse.json(
      { 
        message: 'Registro iniciado. Por favor revisa tu correo y haz clic en el enlace de verificación para completar tu cuenta.',
        preRegistrationId: preRegistration._id,
        classToJoin: classToJoin ? classToJoin.name : null,
        emailSent: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { message: 'Error al procesar la solicitud', details: errorMessage },
      { status: 500 }
    );
  }
}