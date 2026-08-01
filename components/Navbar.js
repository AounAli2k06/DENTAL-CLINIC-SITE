'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CLINIC } from '@/src/lib/constants';

const NAV_LINKS = [
  { hash: '#services', label: 'Services' },
  { hash: '#about', label: 'About' },
  { hash: '#testimonials', label: 'Reviews' },
  { hash: '#location', label: 'Visit' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The section anchors (#services, #about, etc.) only exist on the
  // homepage. On any other page (like /book), a bare "#services" href is a
  // dead link — it just sits there doing nothing since there's no matching
  // element on that page. Prefixing with "/" makes it a real navigation
  // back to the homepage, where Next.js's Link then scrolls to the anchor
  // automatically once the page has mounted.
  const hrefFor = (hash) => (isHome ? hash : `/${hash}`);

  // Close on Escape, and lock background scroll while the mobile menu is
  // open — without this, the page behind the menu keeps scrolling, which
  // reads as broken/janky on a phone.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Close the mobile menu automatically if the viewport is resized past the
  // md breakpoint (e.g. rotating a tablet to landscape) so it can't get
  // stuck open behind the now-visible desktop nav.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handleChange = (e) => {
      if (e.matches) setOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'bg-white/90 shadow-soft backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8 2 5 4.8 5 9c0 3.2 1.4 5 2.1 8.4.3 1.5.6 3.6 2 3.6 1.6 0 1.4-2.7 1.9-4.6.3-1.1.6-1.9 1-1.9s.7.8 1 1.9c.5 1.9.3 4.6 1.9 4.6 1.4 0 1.7-2.1 2-3.6C17.6 14 19 12.2 19 9c0-4.2-3-7-7-7z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold text-brand-dark">
            {CLINIC.shortName}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.hash}
              href={hrefFor(link.hash)}
              className="text-sm font-medium text-brand-dark/70 transition-colors hover:text-brand-teal"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={`tel:${CLINIC.emergencyPhone}`}
            className="text-sm font-semibold text-brand-blue"
          >
            {CLINIC.emergencyPhone}
          </a>
          <Link href="/book" className="btn-primary">
            Book Appointment
          </Link>
        </div>

        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-brand-dark/10 md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M4 7h16"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              animate={open ? { d: 'M6 6l12 12' } : { d: 'M4 7h16' }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M4 12h16"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ opacity: open ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.path
              d="M4 17h16"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              animate={open ? { d: 'M6 18 18 6' } : { d: 'M4 17h16' }}
              transition={{ duration: 0.2 }}
            />
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-brand-dark/5 bg-white md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.hash}
                  href={hrefFor(link.hash)}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 text-sm font-medium text-brand-dark/70 transition-colors active:bg-brand-dark/5"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`tel:${CLINIC.emergencyPhone}`}
                className="rounded-lg px-2 py-3 text-sm font-semibold text-brand-blue"
              >
                Emergency: {CLINIC.emergencyPhone}
              </a>
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2 w-full"
              >
                Book Appointment
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
