import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slot from '@/lib/models/Slot';

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
