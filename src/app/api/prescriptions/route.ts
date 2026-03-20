import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Appointment from '@/lib/models/Appointment';
import Prescription from '@/lib/models/Prescription';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, content, patientName } = await request.json();

    if (!appointmentId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Ensure the appointment belongs to the logged-in doctor
    if (appointment.doctorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const prescription = await Prescription.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        $set: {
          doctorId: session.user.id,
          patientId: appointment.userId,
          patientName,
          content,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, prescription });
  } catch (error) {
    console.error('Error saving prescription:', error);
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 });
  }
}

