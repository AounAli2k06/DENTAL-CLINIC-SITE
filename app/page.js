import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import BookingWidget from '@/components/BookingWidget';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  title: 'Home',
  description:
    'Book general checkups, teeth whitening, root canal therapy, and orthodontics online with BrightSmile Dental Studio in Karachi, Pakistan.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <Testimonials />
        <BookingWidget />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
