/**
 * Seeds example appointments so the admin dashboard AND the analytics page
 * aren't empty on first run. Safe to run multiple times — it clears only
 * appointments tagged with a fixed seed marker in the email domain, rather
 * than wiping your real data.
 *
 * Usage: npm run seed-appointments
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const SEED_EMAIL_DOMAIN = 'example-seed.pk';

const FIRST_NAMES = [
  'Ayesha', 'Bilal', 'Sana', 'Omar', 'Hira', 'Danish', 'Zainab', 'Fahad',
  'Mariam', 'Usman', 'Areeba', 'Hamza', 'Noor', 'Talha', 'Fatima', 'Saad',
];
const LAST_NAMES = [
  'Raza', 'Ahmed', 'Malik', 'Farooq', 'Sheikh', 'Iqbal', 'Hussain', 'Khan',
];

const SERVICES = [
  'General Checkup & Cleaning',
  'Teeth Whitening',
  'Root Canal Therapy',
  'Orthodontics & Aligners',
];

const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dayOffset(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Weighted so most seeded appointments look realistically resolved
// (confirmed/completed) rather than an implausible all-pending backlog.
function randomStatus(isPast) {
  const roll = Math.random();
  if (isPast) {
    if (roll < 0.75) return 'completed';
    if (roll < 0.9) return 'cancelled';
    return 'confirmed';
  }
  if (roll < 0.55) return 'confirmed';
  if (roll < 0.85) return 'pending';
  return 'cancelled';
}

async function main() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const AppointmentSchema = new mongoose.Schema(
    {
      patientName: String,
      email: String,
      phone: String,
      service: String,
      date: Date,
      timeSlot: String,
      notes: String,
      status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    },
    { timestamps: true }
  );

  const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

  // Clean up any previously-seeded example data before re-seeding, so
  // running this script twice doesn't duplicate rows.
  await Appointment.deleteMany({ email: { $regex: `@${SEED_EMAIL_DOMAIN}$` } });

  const seedData = [];
  const usedSlotsByDate = new Map();

  // Spread across the last 30 days through 3 days ahead, 1-3 bookings per
  // day, so the analytics chart on /admin/stats has a realistic-looking
  // 30-day trend instead of a single flat spike.
  for (let dayOffsetValue = -29; dayOffsetValue <= 3; dayOffsetValue++) {
    const bookingsToday = Math.floor(Math.random() * 3); // 0, 1, or 2
    const date = dayOffset(dayOffsetValue);
    const dateKey = date.toISOString().slice(0, 10);

    for (let i = 0; i < bookingsToday; i++) {
      let slot;
      let attempts = 0;
      do {
        slot = pick(TIME_SLOTS);
        attempts++;
      } while (usedSlotsByDate.get(dateKey)?.has(slot) && attempts < 10);

      if (!usedSlotsByDate.has(dateKey)) usedSlotsByDate.set(dateKey, new Set());
      usedSlotsByDate.get(dateKey).add(slot);

      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);

      seedData.push({
        patientName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${dayOffsetValue}.${i}@${SEED_EMAIL_DOMAIN}`,
        phone: `+92 3${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(1000000 + Math.random() * 8999999)}`,
        service: pick(SERVICES),
        date,
        timeSlot: slot,
        status: randomStatus(dayOffsetValue < 0),
        notes: '',
      });
    }
  }

  await Appointment.insertMany(seedData);

  console.log(`Seeded ${seedData.length} example appointments spread across the last 30 days.`);
  console.log('Run this script again any time to reset and regenerate the example data.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
