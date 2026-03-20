import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Slot from '@/lib/models/Slot';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectDB();

    const slot = await Slot.findById(id);
    
    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion of booked slots
    if (slot.isBooked) {
      return NextResponse.json(
        { error: 'Cannot delete booked slot' },
        { status: 400 }
      );
    }

    await Slot.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Slot deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { date, time } = await request.json();

    if (!date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const slot = await Slot.findById(id);
    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    // Only the owning doctor can edit their slots
    if (slot.doctorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent editing booked slots
    if (slot.isBooked) {
      return NextResponse.json(
        { error: 'Cannot edit booked slot' },
        { status: 400 }
      );
    }

    // Prevent duplicates after edit
    const conflict = await Slot.findOne({
      doctorId: slot.doctorId,
      date,
      time,
      _id: { $ne: id },
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'Slot already exists for this time' },
        { status: 400 }
      );
    }

    slot.date = date;
    slot.time = time;
    await slot.save();

    return NextResponse.json({ success: true, slot });
  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 });
  }
}
