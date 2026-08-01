'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { TESTIMONIALS } from '@/src/lib/constants';

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? '#0d9488' : 'none'}
          stroke={i < rating ? '#0d9488' : '#cbd5e1'}
          strokeWidth="1.5"
        >
          <path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.9-6.3-3.3-6.3 3.3 1.2-6.9-5-4.9 7-1L12 2Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % TESTIMONIALS.length);
  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section id="testimonials" className="py-24">
      <div className="container-page">
        <ScrollReveal className="text-center">
          <span className="section-eyebrow">Patient stories</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-brand-dark sm:text-4xl">
            Loved by patients across Karachi.
          </h2>
        </ScrollReveal>

        <div className="mx-auto mt-14 max-w-2xl">
          <div className="relative min-h-[220px] rounded-2xl border border-brand-dark/5 bg-white p-8 shadow-card sm:p-10">
            <svg
              aria-hidden
              width="40"
              height="32"
              viewBox="0 0 40 32"
              fill="none"
              className="absolute right-8 top-8 text-brand-teal/10 sm:right-10 sm:top-10"
            >
              <path
                d="M16.6 0C7.4 3.2 0 11.6 0 21.4 0 27.4 4.6 32 10.4 32c5 0 8.8-3.8 8.8-8.6 0-4.6-3.2-8-7.6-8-.8 0-1.6.2-2 .4C10.2 10.2 14 5.4 20.4 2.8L16.6 0zm22 0C29.4 3.2 22 11.6 22 21.4 22 27.4 26.6 32 32.4 32c5 0 8.8-3.8 8.8-8.6 0-4.6-3.2-8-7.6-8-.8 0-1.6.2-2 .4.4-3.6 4.2-8.4 10.6-11l-3.6-2.8z"
                fill="currentColor"
              />
            </svg>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Stars rating={TESTIMONIALS[index].rating} />
                <p className="mt-5 font-display text-lg leading-relaxed text-brand-dark">
                  &ldquo;{TESTIMONIALS[index].quote}&rdquo;
                </p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-brand-dark">
                    {TESTIMONIALS[index].name}
                  </p>
                  <p className="text-xs text-brand-dark/50">{TESTIMONIALS[index].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 text-brand-dark/60 transition-colors hover:border-brand-teal hover:text-brand-teal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-brand-teal' : 'w-1.5 bg-brand-dark/15'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 text-brand-dark/60 transition-colors hover:border-brand-teal hover:text-brand-teal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
