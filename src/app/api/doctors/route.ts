import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Slot from '@/lib/models/Slot';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all doctors with their specializations and ratings
    const doctors = await User.find({ role: 'doctor' })
      .select('name email specialization experience consultationFee')
      .lean();

    // Get available slots for each doctor
    const doctorsWithSlots = await Promise.all(
      doctors.map(async (doctor: any) => {
        // Get all slots for this doctor (both booked and available)
        const allSlots = await Slot.find({ 
          doctorId: doctor._id.toString(),
          date: { $gte: new Date().toISOString().split('T')[0] }
        })
        .select('date time isBooked patientId')
        .sort({ date: 1, time: 1 })
        .lean();

        // Filter only available slots
        const availableSlots = allSlots.filter(slot => !slot.isBooked);

        return {
          id: doctor._id.toString(),
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization || 'General Practice',
          experience: doctor.experience || 0,
          consultationFee: doctor.consultationFee || 0,
          rating: 4.5, // Default rating - in real app, this would come from reviews
          available: availableSlots.length > 0,
          availableSlots: availableSlots.map((slot: any) => ({
            id: slot._id.toString(),
            date: slot.date,
            time: slot.time,
            available: !slot.isBooked
          })),
          totalSlots: allSlots.length,
          bookedSlots: allSlots.filter(slot => slot.isBooked).length
        };
      })
    );

    return NextResponse.json({ 
      success: true,
      doctors: doctorsWithSlots 
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}
