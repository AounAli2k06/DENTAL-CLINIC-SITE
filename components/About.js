import ScrollReveal from './ScrollReveal';
import Image from 'next/image';

const CREDENTIALS = [
  'BDS, de\u2019Montmorency College of Dentistry, Lahore',
  'Fellow, College of Physicians & Surgeons Pakistan (FCPS)',
  'Invisalign Certified Provider',
  '15+ years in general & cosmetic dentistry',
];

const GALLERY = [
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=600&auto=format&fit=crop',
];

export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="container-page grid gap-16 lg:grid-cols-2 lg:items-center">
        <ScrollReveal>
          <span className="section-eyebrow">Meet your dentist</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-brand-dark sm:text-4xl">
            Dr. Sara Khan
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-dark/70">
            Dr. Khan founded {`BrightSmile`} on a simple idea: dental visits should
            leave you feeling reassured, not rushed. Every treatment plan is explained
            in plain language, every room is designed to feel calm rather than
            clinical, and every patient leaves knowing exactly what happens next.
          </p>

          <ul className="mt-8 space-y-3">
            {CREDENTIALS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-brand-dark/70">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-teal" viewBox="0 0 24 24" fill="none">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2 h-56 w-full overflow-hidden rounded-2xl">
              <Image
                src={GALLERY[0]}
                alt="Dr. Khan with a patient"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              <Image
                src={GALLERY[1]}
                alt="Clinic waiting area"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              <Image
                src={GALLERY[2]}
                alt="Dental treatment equipment"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
