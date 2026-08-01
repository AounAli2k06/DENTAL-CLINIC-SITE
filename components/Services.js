import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { SERVICES, formatPKR } from '@/src/lib/constants';

const ICONS = {
  stethoscope: (
    <path d="M6 3v6a4 4 0 0 0 8 0V3M10 15a6 6 0 0 0 6-6M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  sparkles: (
    <path d="M12 3v4M12 17v4M5 5l2.5 2.5M16.5 16.5 19 19M3 12h4M17 12h4M5 19l2.5-2.5M16.5 7.5 19 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  shield: (
    <path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  align: (
    <path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export default function Services() {
  return (
    <section id="services" className="py-24">
      <div className="container-page">
        <ScrollReveal>
          <span className="section-eyebrow">What we treat</span>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-medium text-brand-dark sm:text-4xl">
            Care built around every stage of your smile.
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.id} delay={i * 0.08}>
              <div
                className={`group relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${
                  service.popular ? 'border-brand-teal/30' : 'border-brand-dark/5'
                }`}
              >
                {service.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-brand-teal px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Most booked
                  </span>
                )}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors duration-300 group-hover:bg-brand-teal group-hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    {ICONS[service.icon]}
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-lg font-medium text-brand-dark">
                  {service.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/60">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-brand-dark/5 pt-4">
                  <div>
                    <p className="font-display text-lg font-medium text-brand-blue">
                      {formatPKR(service.price)}
                    </p>
                    <p className="text-xs text-brand-dark/50">{service.duration} min</p>
                  </div>
                  <Link
                    href={`/book?service=${service.id}`}
                    className="text-sm font-semibold text-brand-teal transition-colors hover:text-teal-700"
                  >
                    Book &rarr;
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
