import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import Appointment from '@/src/models/Appointment';
import { getSessionFromCookies } from '@/src/lib/auth';
import { SERVICES, TIME_SLOTS, CLINIC } from '@/src/lib/constants';
import { dayBoundsFromKey, getClinicNow } from '@/src/lib/dateUtils';
import { sendBookingConfirmationEmail } from '@/src/lib/email';

export const dynamic = 'force-dynamic';

// POST /api/appointments -> create a new appointment (public)
export async function POST(request) {
  try {
    const body = await request.json();
    const { patientName, email, phone, service, date, timeSlot, notes } = body;

    if (!patientName || !email || !phone || !service || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'All required fields must be provided.' },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!TIME_SLOTS.includes(timeSlot)) {
      return NextResponse.json(
        { error: 'Selected time slot is not valid.' },
        { status: 400 }
      );
    }

    const validService = SERVICES.find((s) => s.name === service || s.id === service);
    if (!validService) {
      return NextResponse.json(
        { error: 'Selected service is not valid.' },
        { status: 400 }
      );
    }

    const bounds = dayBoundsFromKey(date);
    if (!bounds) {
      return NextResponse.json(
        { error: 'Selected date is not valid.' },
        { status: 400 }
      );
    }

    const { dateKey: clinicTodayKey } = getClinicNow(CLINIC.timezone);
    if (date < clinicTodayKey) {
      return NextResponse.json(
        { error: 'Cannot book an appointment in the past.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Server-side double-booking guard: check first, then rely on the
    // unique partial index as a hard backstop against race conditions.
    const existing = await Appointment.findOne({
      date: { $gte: bounds.start, $lte: bounds.end },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'That time slot was just booked. Please choose another.' },
        { status: 409 }
      );
    }

    let appointment;
    try {
      appointment = await Appointment.create({
        patientName,
        email,
        phone,
        service: validService.name,
        date: bounds.start,
        timeSlot,
        notes: notes || '',
      });
    } catch (err) {
      if (err.code === 11000) {
        return NextResponse.json(
          { error: 'That time slot was just booked. Please choose another.' },
          { status: 409 }
        );
      }
      if (err.name === 'ValidationError') {
        const firstError = Object.values(err.errors)[0];
        return NextResponse.json(
          { error: firstError?.message || 'Invalid appointment details.' },
          { status: 400 }
        );
      }
      throw err;
    }

    // Fire the confirmation email but never let it fail the booking itself —
    // the appointment is already safely saved by this point. `emailResult`
    // is included in the response only so the admin/dev can see in network
    // tools whether delivery actually happened, without exposing this to
    // end users as an error.
    const emailResult = await sendBookingConfirmationEmail({
      to: email,
      patientName,
      service: validService.name,
      dateKey: date,
      timeSlot,
      price: validService.price,
      notes: notes || '',
    });

    return NextResponse.json({ appointment, emailSent: emailResult.sent }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      {
        error:
          'Could not reach the database while booking your appointment. Please try again shortly.',
      },
      { status: 500 }
    );
  }
}

// GET /api/appointments -> list appointments (admin only)
export async function GET(request) {
  try {
    const session = getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const bounds = dayBoundsFromKey(date);
      if (bounds) {
        query.date = { $gte: bounds.start, $lte: bounds.end };
      }
    }

    if (search) {
      query.patientName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const appointments = await Appointment.find(query).sort({ date: -1, timeSlot: 1 }).lean();

    const { dateKey: clinicTodayKey } = getClinicNow(CLINIC.timezone);
    const todayBounds = dayBoundsFromKey(clinicTodayKey);

    const [total, pending, confirmed, todayCount] = await Promise.all([
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ date: { $gte: todayBounds.start, $lte: todayBounds.end } }),
    ]);

    return NextResponse.json({
      appointments,
      metrics: { total, pending, confirmed, today: todayCount },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      {
        error:
          'Could not reach the database while loading appointments. Check your MongoDB connection.',
      },
      { status: 500 }
    );
  }
}
