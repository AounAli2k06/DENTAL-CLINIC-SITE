import Link from 'next/link';
import { CLINIC } from '@/src/lib/constants';

export default function Footer() {
  return (
    <footer id="location" className="border-t border-brand-dark/5 bg-brand-dark text-slate-300">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8 2 5 4.8 5 9c0 3.2 1.4 5 2.1 8.4.3 1.5.6 3.6 2 3.6 1.6 0 1.4-2.7 1.9-4.6.3-1.1.6-1.9 1-1.9s.7.8 1 1.9c.5 1.9.3 4.6 1.9 4.6 1.4 0 1.7-2.1 2-3.6C17.6 14 19 12.2 19 9c0-4.2-3-7-7-7z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="font-display text-lg font-semibold text-white">
              {CLINIC.shortName}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Modern, comfortable dental care in the heart of {CLINIC.address.city}.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={CLINIC.social.instagram}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:border-brand-teal hover:text-brand-teal"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href={CLINIC.social.facebook}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:border-brand-teal hover:text-brand-teal"
              aria-label="Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Opening Hours</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CLINIC.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4 text-slate-400">
                <span>{h.day}</span>
                <span>{h.open ? `${h.open} – ${h.close}` : 'Closed'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Visit Us</h3>
          <address className="mt-4 space-y-2 text-sm not-italic text-slate-400">
            <p>{CLINIC.address.street}</p>
            <p>
              {CLINIC.address.city}, {CLINIC.address.region} {CLINIC.address.postalCode}
            </p>
            <p className="pt-2">
              <a href={`tel:${CLINIC.phone}`} className="hover:text-brand-teal">
                {CLINIC.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${CLINIC.email}`} className="hover:text-brand-teal">
                {CLINIC.email}
              </a>
            </p>
          </address>
          <div className="mt-4 h-40 w-full overflow-hidden rounded-xl border border-white/10">
            <iframe
              title={`${CLINIC.name} location map`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                `${CLINIC.address.street}, ${CLINIC.address.city}, ${CLINIC.address.region}, Pakistan`
              )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/#services" className="hover:text-brand-teal">General Checkups</Link></li>
            <li><Link href="/#services" className="hover:text-brand-teal">Teeth Whitening</Link></li>
            <li><Link href="/#services" className="hover:text-brand-teal">Root Canal Therapy</Link></li>
            <li><Link href="/#services" className="hover:text-brand-teal">Orthodontics</Link></li>
            <li><Link href="/book" className="hover:text-brand-teal">Book an Appointment</Link></li>
            <li><Link href="/admin/login" className="hover:text-brand-teal">Staff Login</Link></li>
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-white">We Accept</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Cash', 'Card', 'EasyPaisa', 'JazzCash'].map((method) => (
              <span
                key={method}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {CLINIC.name}. All rights reserved.</p>
          <p>Emergency line: {CLINIC.emergencyPhone}</p>
        </div>
      </div>
    </footer>
  );
}
