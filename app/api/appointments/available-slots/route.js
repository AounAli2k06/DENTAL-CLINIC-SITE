import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import Appointment from '@/src/models/Appointment';
import { TIME_SLOTS, CLINIC } from '@/src/lib/constants';
import { dayBoundsFromKey, getClinicNow } from '@/src/lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/appointments/available-slots?date=YYYY-MM-DD -> returns free slots (public)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'A date is required.' }, { status: 400 });
    }

    const bounds = dayBoundsFromKey(date);
    if (!bounds) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const bookedAppointments = await Appointment.find({
      date: { $gte: bounds.start, $lte: bounds.end },
      status: { $in: ['pending', 'confirmed'] },
    })
      .select('timeSlot -_id')
      .lean();

    const bookedSlots = new Set(bookedAppointments.map((a) => a.timeSlot));

    const { dateKey: clinicTodayKey, minutesSinceMidnight: clinicNowMinutes } =
      getClinicNow(CLINIC.timezone);
    const isToday = date === clinicTodayKey;

    const slots = TIME_SLOTS.map((slot) => {
      const disabledByTime = isToday && slotToMinutes(slot) <= clinicNowMinutes;
      return {
        time: slot,
        available: !bookedSlots.has(slot) && !disabledByTime,
      };
    });

    return NextResponse.json({ date, slots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      {
        error:
          'Could not reach the database while fetching available times. Please check your connection and try again.',
      },
      { status: 500 }
    );
  }
}

function slotToMinutes(slot) {
  const [time, meridiem] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}
