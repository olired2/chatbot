import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { ClassModel } from '@/models/Class';
import { PreRegistrationModel } from '@/models/PreRegistration';
import connectDB from '@/lib/db/mongodb';
import { isTokenValid } from '@/lib/email/verification';

// Marcar como dinámico para evitar generación estática
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar pre-registro por token
    const preRegistration = await PreRegistrationModel.findOne({
      verificationToken: token
    });

    if (!preRegistration) {
      return NextResponse.json(
        { 
          message: 'Token de verificación inválido, ya utilizado o expirado',
          verified: false,
          expired: true
        },
        { status: 400 }
      );
    }

    // Verificar manualmente si ha expirado (por si el TTL no ha actuado aún)
    const now = new Date();
    if (preRegistration.expiresAt && preRegistration.expiresAt < now) {
      // Eliminar registro expirado manualmente
      await PreRegistrationModel.findByIdAndDelete(preRegistration._id);
      console.log(`🗑️ Pre-registro expirado eliminado para: ${preRegistration.email}`);
      
      return NextResponse.json(
        { 
          message: 'El enlace de verificación ha expirado. Por favor, registrate nuevamente.',
          verified: false,
          expired: true
        },
        { status: 400 }
      );
    }

    // Verificar si ya existe un usuario con este email
    const existingUser = await UserModel.findOne({ email: preRegistration.email });
    if (existingUser) {
      // Limpiar pre-registro si ya existe el usuario
      await PreRegistrationModel.findByIdAndDelete(preRegistration._id);
      return NextResponse.json(
        { 
          message: 'Esta cuenta ya fue verificada anteriormente. Puedes iniciar sesión.',
          verified: true,
          userEmail: existingUser.email,
          userName: existingUser.nombre
        },
        { status: 200 }
      );
    }

    // CREAR EL USUARIO REAL AHORA
    const newUser = await UserModel.create({
      nombre: preRegistration.nombre,
      email: preRegistration.email,
      password: preRegistration.password, // Ya está hasheada
      rol: preRegistration.rol,
      institucion: preRegistration.institucion,
      emailVerified: true // Ya está verificado
    });

    // Si había código de clase, inscribir al estudiante
    if (preRegistration.codigoClase) {
      const classToJoin = await ClassModel.findOne({ 
        code: preRegistration.codigoClase.toUpperCase() 
      });
      
      if (classToJoin) {
        await ClassModel.findByIdAndUpdate(
          classToJoin._id,
          { $addToSet: { students: newUser._id } }
        );
        
        await UserModel.findByIdAndUpdate(
          newUser._id,
          { $addToSet: { classes: classToJoin._id } }
        );
        
        console.log(`📚 Usuario ${newUser.email} inscrito en clase: ${classToJoin.name}`);
      }
    }

    // Eliminar pre-registro ya que se completó
    await PreRegistrationModel.findByIdAndDelete(preRegistration._id);

    console.log(`✅ Usuario CREADO y verificado: ${newUser.email}`);

    return NextResponse.json(
      { 
        message: 'Email verificado y cuenta creada exitosamente. Ya puedes iniciar sesión.',
        verified: true,
        userEmail: newUser.email,
        userName: newUser.nombre
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error verificando email:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}