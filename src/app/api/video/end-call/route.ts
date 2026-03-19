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

    // Find appointment (doctor or patient can end call)
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      $or: [
        { doctorId: session.user.id },
        { userId: session.user.id }
      ]
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Update appointment status to completed
    appointment.status = 'completed';
    appointment.callEndTime = new Date();
    appointment.callDuration = appointment.callStartTime ? 
      Math.round((new Date().getTime() - new Date(appointment.callStartTime).getTime()) / 60000) : 0;
    
    await appointment.save();

    return NextResponse.json({ 
      success: true,
      message: 'Call ended successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        callDuration: appointment.callDuration
      }
    });

  } catch (error) {
    console.error('Error ending call:', error);
    return NextResponse.json(
      { error: 'Failed to end call' },
      { status: 500 }
    );
  }
}
