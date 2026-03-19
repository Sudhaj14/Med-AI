import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slot from '@/lib/models/Slot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    await connectDB();

    let query: any = {};
    if (doctorId) {
      query.doctorId = doctorId;
    }

    const slots = await Slot.find(query)
      .populate('doctorId', 'name email specialization')
      .sort({ date: 1, time: 1 });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const slotData = await request.json();

    await connectDB();

    // Check if slot already exists
    const existingSlot = await Slot.findOne({
      doctorId: slotData.doctorId,
      date: slotData.date,
      time: slotData.time,
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: 'Slot already exists for this time' },
        { status: 400 }
      );
    }

    const slot = new Slot(slotData);
    await slot.save();

    return NextResponse.json({ 
      success: true, 
      slot,
      message: 'Slot created successfully!' 
    });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
}
