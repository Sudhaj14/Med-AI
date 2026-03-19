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

    // Verify patient owns this appointment and call is in progress
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: session.user.id
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.status !== 'in_progress') {
      return NextResponse.json({ 
        error: 'Call not started yet. Please wait for doctor to start call.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Joined call successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        doctor: appointment.doctor
      }
    });

  } catch (error) {
    console.error('Error joining call:', error);
    return NextResponse.json(
      { error: 'Failed to join call' },
      { status: 500 }
    );
  }
}
