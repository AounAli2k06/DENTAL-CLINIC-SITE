'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { CLINIC } from '@/src/lib/constants';

const FAQS = [
  {
    question: 'Do I need to pay online when booking?',
    answer:
      "No. Booking online only reserves your slot — payment happens in person at the clinic after your visit. We accept cash, card, EasyPaisa, and JazzCash.",
  },
  {
    question: 'Can I reschedule or cancel my appointment?',
    answer:
      `Yes, just call or WhatsApp us at ${CLINIC.phone} as early as possible so we can offer your slot to another patient.`,
  },
  {
    question: 'Do you accept walk-ins without a booking?',
    answer:
      "We prioritize booked appointments to keep wait times short, but we do our best to accommodate walk-ins and genuine emergencies — call ahead if you can.",
  },
  {
    question: 'How early should I arrive for my appointment?',
    answer:
      'Please arrive 10-15 minutes early, especially for your first visit, so we can complete a quick patient intake before your treatment time.',
  },
  {
    question: 'Is teeth whitening safe for sensitive teeth?',
    answer:
      "We assess your sensitivity during the consultation before any whitening treatment and adjust the approach accordingly — it's discussed openly before we proceed, never assumed.",
  },
  {
    question: 'Do you treat children?',
    answer:
      'Yes, our general checkups and cleanings are suitable for children, and our team is experienced in making younger patients comfortable.',
  },
];

function buildFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-brand-dark/5 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-brand-dark">{faq.question}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={`flex-shrink-0 text-brand-teal transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-brand-dark/60">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const jsonLd = buildFAQSchema();

  return (
    <section className="bg-white py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-page">
        <ScrollReveal className="text-center">
          <span className="section-eyebrow">Common questions</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-brand-dark sm:text-4xl">
            Everything you might want to know first.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-brand-dark/5 px-6 shadow-card sm:px-8">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
