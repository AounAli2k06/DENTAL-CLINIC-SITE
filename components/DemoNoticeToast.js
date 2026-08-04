'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const DISMISSED_KEY = 'demoNoticeDismissed';

export default function DemoNoticeToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // sessionStorage (not localStorage) is deliberate — the notice comes
    // back if someone opens a fresh tab/session later, rather than being
    // dismissed once and never seen again by a future visitor on the same
    // browser profile.
    const alreadyDismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (alreadyDismissed) return;

    // A short delay before it appears feels like a gentle heads-up rather
    // than an immediate pop-up blocking the page the instant it loads.
    const timer = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, x: -8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-5 z-40 w-[268px] rounded-2xl border border-brand-dark/5 bg-white p-3.5 shadow-soft sm:bottom-6 sm:left-6 sm:w-[290px]"
        >
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3a6 6 0 0 0-6 6v3.2c0 .5-.2 1-.5 1.4L4 15.5c-.6.8 0 2 1 2h14c1 0 1.6-1.2 1-2l-1.5-2c-.3-.4-.5-.9-.5-1.4V9a6 6 0 0 0-6-6Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <p className="flex-1 text-xs leading-relaxed text-brand-dark/70">
              This is a demo project, not a real clinic — bookings here aren&rsquo;t
              seen by an actual dentist and won&rsquo;t receive a reply.
            </p>
            <button
              onClick={dismiss}
              aria-label="Dismiss notice"
              className="flex-shrink-0 rounded-full p-1 text-brand-dark/30 transition-colors hover:bg-brand-dark/5 hover:text-brand-dark/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
