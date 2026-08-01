'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CLINIC } from '@/src/lib/constants';

const TRUST_BADGES = [
  'PMDC Registered Dentists',
  'Invisalign Certified',
  '15+ Years Experience',
  '4.9/5 Patient Rating',
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-brand-light pb-20 pt-16 lg:pb-28 lg:pt-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-teal/10 blur-3xl"
        animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -14, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-page relative grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-eyebrow">Trusted family &amp; cosmetic dentistry</span>
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.1] text-brand-dark sm:text-5xl lg:text-6xl">
            Dental care that feels as good as your smile looks.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-dark/70">
            From routine checkups to complete smile transformations, {CLINIC.name} pairs
            gentle, modern treatment with same-week availability — booked online in
            under two minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/book" className="btn-primary">
              Book Appointment
              <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a href={`tel:${CLINIC.emergencyPhone}`} className="btn-secondary">
              <svg className="mr-2 h-4 w-4 text-brand-teal" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 2c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" fill="currentColor" />
              </svg>
              Emergency: {CLINIC.emergencyPhone}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {TRUST_BADGES.map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-sm text-brand-dark/60">
                <svg className="h-4 w-4 flex-shrink-0 text-brand-teal" viewBox="0 0 24 24" fill="none">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {badge}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop"
              alt="Bright, modern dental treatment room"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute -left-2 bottom-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft sm:-left-6 sm:bottom-8 sm:px-5 sm:py-4"
          >
            <div className="flex -space-x-3">
              {['emma', 'james', 'sara'].map((seed) => (
                <Image
                  key={seed}
                  src={`https://images.unsplash.com/photo-${
                    seed === 'emma' ? '1494790108377-be9c29b29330' :
                    seed === 'james' ? '1500648767791-00dcc994a43e' :
                    '1544005313-94ddf0286df2'
                  }?q=80&w=100&auto=format&fit=crop&crop=faces`}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">2,400+ patients</p>
              <p className="text-xs text-brand-dark/50">treated with care</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
