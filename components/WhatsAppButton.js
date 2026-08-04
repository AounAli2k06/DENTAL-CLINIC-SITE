'use client';

import { motion } from 'framer-motion';
import { CLINIC } from '@/src/lib/constants';

export default function WhatsAppButton() {
  const message = encodeURIComponent(
    `Hi ${CLINIC.name}, I'd like to ask about booking an appointment.`
  );
  const href = `https://wa.me/${CLINIC.whatsapp.replace(/\D/g, '')}?text=${message}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-soft sm:bottom-6 sm:right-6"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="relative">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38A9.94 9.94 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm5.7 14.16c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.13.11-1.83-.11-.42-.14-.96-.32-1.65-.63-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.14.11.31.02.49-.51 1.02-1.05 1-.77 1.48.99 1.71 1.8 2.24 3.31 3.02.24.13.39.11.53-.04.14-.15.6-.7.76-.94.16-.24.32-.2.53-.12.21.08 1.36.64 1.6.76.24.11.4.17.45.27.06.1.06.55-.18 1.23z" />
      </svg>
    </motion.a>
  );
}
