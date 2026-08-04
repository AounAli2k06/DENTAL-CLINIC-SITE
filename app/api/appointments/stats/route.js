import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import Appointment from '@/src/models/Appointment';
import { getSessionFromCookies } from '@/src/lib/auth';
import { SERVICES, CLINIC } from '@/src/lib/constants';
import { dayBoundsFromKey, getClinicNow, dateToKeyUTC } from '@/src/lib/dateUtils';

export const dynamic = 'force-dynamic';

const REVENUE_STATUSES = ['confirmed', 'completed'];

function priceForService(serviceName) {
  const match = SERVICES.find((s) => s.name === serviceName);
  return match ? match.price : 0;
}

// GET /api/appointments/stats -> aggregate analytics for the admin dashboard
export async function GET() {
  try {
    const session = getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { dateKey: todayKey } = getClinicNow(CLINIC.timezone);
    const todayBounds = dayBoundsFromKey(todayKey);

    // --- Last 30 days, one point per day (zero-filled, not just whatever
    // days happen to have bookings) ---
    const thirtyDaysAgoStart = new Date(todayBounds.start);
    thirtyDaysAgoStart.setUTCDate(thirtyDaysAgoStart.getUTCDate() - 29);

    const dailyAgg = await Appointment.aggregate([
      { $match: { date: { $gte: thirtyDaysAgoStart, $lte: todayBounds.end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
    ]);
    const dailyMap = new Map(dailyAgg.map((d) => [d._id, d.count]));

    const dailyCounts = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgoStart);
      d.setUTCDate(d.getUTCDate() + i);
      const key = dateToKeyUTC(d);
      dailyCounts.push({ date: key, count: dailyMap.get(key) || 0 });
    }

    // --- Service popularity, all-time ---
    const serviceAgg = await Appointment.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const serviceBreakdown = serviceAgg.map((s) => ({ service: s._id, count: s.count }));

    // --- Status breakdown, all-time ---
    const statusAgg = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusBreakdown = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const s of statusAgg) {
      if (s._id in statusBreakdown) statusBreakdown[s._id] = s.count;
    }

    // --- Revenue estimate: this month vs last month, confirmed+completed
    // only (pending/cancelled shouldn't count as realized revenue) ---
    const currentMonthStart = new Date(
      Date.UTC(todayBounds.start.getUTCFullYear(), todayBounds.start.getUTCMonth(), 1)
    );
    const lastMonthStart = new Date(
      Date.UTC(todayBounds.start.getUTCFullYear(), todayBounds.start.getUTCMonth() - 1, 1)
    );
    const lastMonthEnd = new Date(currentMonthStart.getTime() - 1);

    async function revenueForRange(start, end) {
      const appts = await Appointment.find({
        date: { $gte: start, $lte: end },
        status: { $in: REVENUE_STATUSES },
      })
        .select('service -_id')
        .lean();
      return appts.reduce((sum, a) => sum + priceForService(a.service), 0);
    }

    const [thisMonthRevenue, lastMonthRevenue, thisMonthBookings] = await Promise.all([
      revenueForRange(currentMonthStart, todayBounds.end),
      revenueForRange(lastMonthStart, lastMonthEnd),
      Appointment.countDocuments({ date: { $gte: currentMonthStart, $lte: todayBounds.end } }),
    ]);

    const totalAppointments = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
    const cancellationRate =
      totalAppointments > 0 ? (statusBreakdown.cancelled / totalAppointments) * 100 : 0;

    return NextResponse.json({
      dailyCounts,
      serviceBreakdown,
      statusBreakdown,
      thisMonthBookings,
      cancellationRate,
      revenue: { thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue },
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    return NextResponse.json(
      { error: 'Could not reach the database while loading analytics.' },
      { status: 500 }
    );
  }
}
