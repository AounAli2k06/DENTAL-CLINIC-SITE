import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingFlow from './BookingFlow';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  title: 'Book an Appointment',
  description:
    'Choose your service, pick an available time slot, and confirm your dental appointment online in minutes.',
  alternates: {
    canonical: '/book',
  },
};

export default function BookPage() {
  return (
    <>
      <Navbar />
      <main className="bg-brand-light py-16">
        <BookingFlow />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
