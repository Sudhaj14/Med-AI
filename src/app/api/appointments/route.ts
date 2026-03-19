import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Appointment from '@/lib/models/Appointment';
import HealthMetric from '@/lib/models/HealthMetric';
import ChatMessage from '@/lib/models/ChatMessage';
import User from '@/lib/models/User';
import Slot from '@/lib/models/Slot';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId, date, time, reason, symptoms, healthMetrics, chatHistory } = await request.json();

    if (!doctorId || !date || !time || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Check if the slot is still available
    const existingSlot = await Slot.findOne({ 
      doctorId, 
      date, 
      time 
    });
    
    if (!existingSlot) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 });
    }
    
    if (existingSlot.isBooked) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
    }

    // Fetch recent health metrics if not provided
    let metricsData = healthMetrics;
    if (!metricsData) {
      const recentMetrics = await HealthMetric.find({ userId: session.user.id })
        .sort({ timestamp: -1 })
        .limit(10);
      metricsData = recentMetrics.map(metric => ({
        type: metric.type,
        value: metric.value,
        unit: metric.unit,
        timestamp: metric.timestamp,
      }));
    }

    // Fetch recent chat history if not provided
    let chatData = chatHistory;
    if (!chatData) {
      const recentChats = await ChatMessage.find({ userId: session.user.id })
        .sort({ timestamp: -1 })
        .limit(5);
      chatData = recentChats.map(chat => `User: ${chat.message}\nAssistant: ${chat.response}`).join('\n\n');
    }

    // Fetch real doctor data from database
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const selectedDoctor = {
      name: doctor.name,
      specialization: doctor.specialization || 'General Practice',
      experience: doctor.experience || 0,
      rating: 4.5, // Default rating - in real app, this would come from reviews
      education: 'Medical Degree', // Default education - in real app, this would come from profile
      consultationFee: doctor.consultationFee || 0,
    };

    const appointment = new Appointment({
      userId: session.user.id,
      doctorId,
      doctor: selectedDoctor,
      date,
      time,
      reason,
      symptoms: symptoms || [],
      healthMetrics: metricsData,
      chatHistory: chatData,
      status: 'scheduled',
    });

    await appointment.save();

    // Mark the slot as booked
    const slot = await Slot.findOne({ 
      doctorId, 
      date, 
      time, 
      isBooked: false 
    });
    
    if (slot) {
      slot.isBooked = true;
      slot.patientId = session.user.id;
      await slot.save();
    }

    return NextResponse.json({ 
      success: true, 
      appointment: {
        id: appointment._id,
        userId: appointment.userId,
        doctorId: appointment.doctorId,
        doctor: appointment.doctor,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
      message: 'Appointment booked successfully!' 
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to book appointment';
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid appointment data: ' + Object.values(error.errors).map((e: any) => e.message).join(', ');
    } else if (error.message.includes('User')) {
      errorMessage = 'Authentication error. Please try logging in again.';
    } else if (error.message.includes('Appointment')) {
      errorMessage = 'Database error. Please try again.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    await connectDB();

    let appointments;
    if (doctorId) {
      // Get appointments for a specific doctor
      appointments = await Appointment.find({ doctorId })
        .sort({ createdAt: -1 });
    } else {
      // Get appointments for the current user (patient)
      appointments = await Appointment.find({ userId: session.user.id })
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ 
      appointments: appointments.map(apt => ({
        id: apt._id,
        userId: apt.userId,
        doctorId: apt.doctorId,
        doctor: apt.doctor,
        date: apt.date,
        time: apt.time,
        reason: apt.reason,
        symptoms: apt.symptoms,
        status: apt.status,
        callStartTime: apt.callStartTime,
        callEndTime: apt.callEndTime,
        callDuration: apt.callDuration,
        consultationFee: apt.doctor?.consultationFee || 0,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    return NextResponse.json(
      { error: 'Failed to get appointments' },
      { status: 500 }
    );
  }
}
