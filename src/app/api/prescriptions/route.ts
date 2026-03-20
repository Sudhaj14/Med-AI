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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== 'doctor' && role !== 'patient') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const prescriptionsFilter =
      role === 'doctor'
        ? { doctorId: session.user.id }
        : { patientId: session.user.id };

    const prescriptions = await Prescription.find(prescriptionsFilter)
      .sort({ createdAt: -1 })
      .lean();

    const appointmentIds = prescriptions.map((p) => p.appointmentId);
    const appointments =
      appointmentIds.length > 0
        ? await Appointment.find({ _id: { $in: appointmentIds } })
            .select('date time reason status doctor userId')
            .lean()
        : [];

    const appointmentMap = new Map(
      appointments.map((a) => [a._id.toString(), a])
    );

    return NextResponse.json({
      prescriptions: prescriptions.map((p) => {
        const appt = appointmentMap.get(p.appointmentId?.toString?.() || '');
        return {
          id: p._id?.toString?.() || undefined,
          appointmentId: p.appointmentId?.toString?.() || p.appointmentId,
          doctorId: p.doctorId?.toString?.() || p.doctorId,
          patientId: p.patientId?.toString?.() || p.patientId,
          patientName: p.patientName,
          content: p.content,
          createdAt: p.createdAt,
          appointment: appt
            ? {
                id: appt._id?.toString?.() || appt._id,
                date: appt.date,
                time: appt.time,
                reason: appt.reason,
                status: appt.status,
                doctor: appt.doctor,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

