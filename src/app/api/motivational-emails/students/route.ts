import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStudentsWithActivityForTeacher, sendManualEmailToStudent } from '@/lib/email/email-automation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const result = await getStudentsWithActivityForTeacher(session.user.id);
    
    if (result.success) {
      return NextResponse.json({ students: result.students });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/motivational-emails/students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Maestro') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { studentId, classId } = await req.json();
    
    if (!studentId || !classId) {
      return NextResponse.json({ error: 'studentId and classId are required' }, { status: 400 });
    }

    const result = await sendManualEmailToStudent(studentId, classId);
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/motivational-emails/students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
