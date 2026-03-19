import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Appointment from '@/lib/models/Appointment';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    await connectDB();

    // Verify doctor owns this appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: session.user.id
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Update appointment status to indicate call is starting
    appointment.status = 'in_progress';
    appointment.callStartTime = new Date();
    await appointment.save();

    return NextResponse.json({ 
      success: true,
      message: 'Call started successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        callStartTime: appointment.callStartTime
      }
    });

  } catch (error) {
    console.error('Error starting call:', error);
    return NextResponse.json(
      { error: 'Failed to start call' },
      { status: 500 }
    );
  }
}
