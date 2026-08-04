export const CLINIC = {
  name: 'BrightSmile Dental Studio',
  shortName: 'BrightSmile',
  phone: '+92 21 3456 7890',
  emergencyPhone: '+92 300 123 4567',
  whatsapp: '+923001234567', // digits only (with country code), as WhatsApp's link format requires
  email: 'hello@brightsmiledental.pk',
  address: {
    street: 'Plot 14-C, Khayaban-e-Shahbaz, DHA Phase 6',
    city: 'Karachi',
    region: 'Sindh',
    postalCode: '75500',
    country: 'PK',
  },
  hours: [
    { day: 'Monday', open: '10:00', close: '20:00' },
    { day: 'Tuesday', open: '10:00', close: '20:00' },
    { day: 'Wednesday', open: '10:00', close: '20:00' },
    { day: 'Thursday', open: '10:00', close: '20:00' },
    { day: 'Friday', open: '15:00', close: '20:00' },
    { day: 'Saturday', open: '11:00', close: '18:00' },
    { day: 'Sunday', open: null, close: null },
  ],
  geo: { latitude: 24.8607, longitude: 67.0011 },
  // IANA timezone the clinic operates in — used to decide whether "today's"
  // slots have already passed, regardless of which timezone the server or
  // the patient's browser happens to be in.
  timezone: 'Asia/Karachi',
  currency: 'PKR',
  social: {
    instagram: 'https://instagram.com/brightsmiledental.pk',
    facebook: 'https://facebook.com/brightsmiledental.pk',
  },
};

// Formats a whole-number PKR amount the way it's conventionally written in
// Pakistan: "Rs. 2,500" rather than "PKR 2500.00" or "$2,500".
export function formatPKR(amount) {
  return `Rs. ${new Intl.NumberFormat('en-PK').format(amount)}/-`;
}

export const SERVICES = [
  {
    id: 'general-checkup',
    name: 'General Checkup & Cleaning',
    description:
      'Comprehensive exam, professional cleaning, and personalized oral health plan.',
    price: 2500,
    duration: 30,
    icon: 'stethoscope',
    popular: true,
  },
  {
    id: 'teeth-whitening',
    name: 'Teeth Whitening',
    description:
      'In-studio whitening treatment for a noticeably brighter smile in one visit.',
    price: 18000,
    duration: 60,
    icon: 'sparkles',
  },
  {
    id: 'root-canal',
    name: 'Root Canal Therapy',
    description:
      'Gentle, precise treatment to relieve pain and save the natural tooth.',
    price: 12000,
    duration: 90,
    icon: 'shield',
  },
  {
    id: 'orthodontics',
    name: 'Orthodontics & Aligners',
    description:
      'Custom clear aligner plans to straighten teeth discreetly and comfortably.',
    price: 120000,
    duration: 45,
    icon: 'align',
  },
];

export const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM',
];

export const TESTIMONIALS = [
  {
    name: 'Ayesha Raza',
    role: 'Patient since 2021',
    rating: 5,
    quote:
      'The most comfortable dental visit I have ever had. The team explained every step and I never once felt rushed.',
  },
  {
    name: 'Bilal Ahmed',
    role: 'Orthodontics patient',
    rating: 5,
    quote:
      'My aligner journey was smooth from the first consult to the final fitting. Booking appointments online made it effortless.',
  },
  {
    name: 'Sana Malik',
    role: 'Patient since 2019',
    rating: 5,
    quote:
      'Dr. Khan has a gentle chairside manner and the studio itself feels calm rather than clinical. Highly recommend.',
  },
  {
    name: 'Omar Farooq',
    role: 'Emergency care patient',
    rating: 4,
    quote:
      'Had a dental emergency on a Saturday and they fit me in within the hour. Genuinely grateful for the quick response.',
  },
  {
    name: 'Hira Sheikh',
    role: 'Teeth whitening patient',
    rating: 5,
    quote:
      'Noticeably brighter after a single sitting, and the pricing was clearly explained before I even sat in the chair.',
  },
  {
    name: 'Danish Iqbal',
    role: 'Patient since 2022',
    rating: 5,
    quote:
      'Booked online in the evening and got a slot the very next day. No waiting around at the clinic either.',
  },
  {
    name: 'Zainab Hussain',
    role: 'Root canal patient',
    rating: 5,
    quote:
      'I was dreading this appointment for weeks, but it turned out completely painless. Cannot recommend Dr. Khan enough.',
  },
  {
    name: 'Fahad Sheikh',
    role: 'Parent of two patients',
    rating: 4,
    quote:
      'Both my kids actually look forward to their checkups now. The staff is patient and genuinely good with children.',
  },
];
