/**
 * Seeds example appointments so the admin dashboard isn't empty on first
 * run. Safe to run multiple times — it clears only the appointments it
 * previously seeded (tagged via a fixed set of patient emails) rather than
 * wiping your real data.
 *
 * Usage: npm run seed-appointments
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

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

  const SEED_TAG_EMAILS = [
    'ayesha.raza@example.pk',
    'bilal.ahmed@example.pk',
    'sana.malik@example.pk',
    'omar.farooq@example.pk',
    'hira.sheikh@example.pk',
    'danish.iqbal@example.pk',
  ];

  // Clean up any previously-seeded example data before re-seeding, so
  // running this script twice doesn't duplicate rows.
  await Appointment.deleteMany({ email: { $in: SEED_TAG_EMAILS } });

  function dayOffset(days) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  }

  const seedData = [
    {
      patientName: 'Ayesha Raza',
      email: 'ayesha.raza@example.pk',
      phone: '+92 300 111 2222',
      service: 'General Checkup & Cleaning',
      date: dayOffset(0),
      timeSlot: '11:00 AM',
      status: 'confirmed',
      notes: '',
    },
    {
      patientName: 'Bilal Ahmed',
      email: 'bilal.ahmed@example.pk',
      phone: '+92 301 222 3333',
      service: 'Orthodontics & Aligners',
      date: dayOffset(0),
      timeSlot: '03:00 PM',
      status: 'pending',
      notes: 'First consultation for clear aligners.',
    },
    {
      patientName: 'Sana Malik',
      email: 'sana.malik@example.pk',
      phone: '+92 302 333 4444',
      service: 'Teeth Whitening',
      date: dayOffset(1),
      timeSlot: '12:00 PM',
      status: 'confirmed',
      notes: '',
    },
    {
      patientName: 'Omar Farooq',
      email: 'omar.farooq@example.pk',
      phone: '+92 303 444 5555',
      service: 'Root Canal Therapy',
      date: dayOffset(2),
      timeSlot: '02:30 PM',
      status: 'pending',
      notes: 'Sensitivity on upper left molar.',
    },
    {
      patientName: 'Hira Sheikh',
      email: 'hira.sheikh@example.pk',
      phone: '+92 304 555 6666',
      service: 'General Checkup & Cleaning',
      date: dayOffset(-2),
      timeSlot: '10:30 AM',
      status: 'completed',
      notes: '',
    },
    {
      patientName: 'Danish Iqbal',
      email: 'danish.iqbal@example.pk',
      phone: '+92 305 666 7777',
      service: 'Teeth Whitening',
      date: dayOffset(-5),
      timeSlot: '05:00 PM',
      status: 'cancelled',
      notes: 'Rescheduling requested by patient.',
    },
  ];

  await Appointment.insertMany(seedData);

  console.log(`Seeded ${seedData.length} example appointments.`);
  console.log('Run this script again any time to reset the example data.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
