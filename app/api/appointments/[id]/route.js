import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import Appointment from '@/src/models/Appointment';
import { getSessionFromCookies } from '@/src/lib/auth';
import { sendStatusUpdateEmail } from '@/src/lib/email';
import { dateToKeyUTC } from '@/src/lib/dateUtils';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// PATCH /api/appointments/:id -> update status (admin only)
export async function PATCH(request, { params }) {
  try {
    const session = getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    await dbConnect();

    const existing = await Appointment.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    const previousStatus = existing.status;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    // Only notify the patient if the status actually changed — re-saving the
    // same status (e.g. clicking the dropdown without changing it) shouldn't
    // spam them with a duplicate email.
    let emailResult = { sent: false, reason: 'unchanged' };
    if (previousStatus !== status) {
      emailResult = await sendStatusUpdateEmail({
        to: appointment.email,
        patientName: appointment.patientName,
        service: appointment.service,
        dateKey: dateToKeyUTC(appointment.date),
        timeSlot: appointment.timeSlot,
        status: appointment.status,
      });
    }

    return NextResponse.json({ appointment, emailSent: emailResult.sent });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment.' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/:id -> remove an appointment (admin only)
export async function DELETE(request, { params }) {
  try {
    const session = getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment.' },
      { status: 500 }
    );
  }
}
