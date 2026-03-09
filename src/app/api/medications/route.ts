import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Medication from '@/lib/models/Medication';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, dosage, frequency, startTime, notes } = await request.json();

    if (!name || !dosage || !frequency || !startTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const medication = new Medication({
      userId: session.user.id,
      name,
      dosage,
      frequency,
      startTime,
      notes,
    });

    await medication.save();

    return NextResponse.json(medication);
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { error: 'Failed to create medication' },
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

    await connectDB();
    const medications = await Medication.find({ userId: session.user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({ medications });
  } catch (error) {
    console.error('Error getting medications:', error);
    return NextResponse.json(
      { error: 'Failed to get medications' },
      { status: 500 }
    );
  }
}
