'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CLINIC } from '@/src/lib/constants';
import { toDateKey } from '@/src/lib/dateUtils';

const NAV_ITEMS = [
  { label: 'Overview', status: 'all', date: null, icon: 'grid' },
  { label: "Today's Visits", status: 'all', date: 'today', icon: 'calendar' },
  { label: 'Pending', status: 'pending', date: null, icon: 'clock' },
  { label: 'Confirmed', status: 'confirmed', date: null, icon: 'check' },
  { label: 'Completed', status: 'completed', date: null, icon: 'check-circle' },
  { label: 'Cancelled', status: 'cancelled', date: null, icon: 'x' },
];

const ICONS = {
  grid: <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  clock: <><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" /><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  check: <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  'check-circle': <><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
};

function buildHref(item) {
  const params = new URLSearchParams();
  if (item.status !== 'all') params.set('status', item.status);
  if (item.date === 'today') params.set('date', toDateKey(new Date()));
  const query = params.toString();
  return `/admin${query ? `?${query}` : ''}`;
}

function isActive(item, searchParams) {
  const status = searchParams.get('status') || 'all';
  const date = searchParams.get('date') || '';
  const wantsToday = item.date === 'today';
  const todayKey = toDateKey(new Date());

  if (item.status !== status) return false;
  if (wantsToday) return date === todayKey;
  return !date;
}

function NavLink({ item, searchParams }) {
  const active = isActive(item, searchParams);
  return (
    <Link
      href={buildHref(item)}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-blue text-white'
          : 'text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
        {ICONS[item.icon]}
      </svg>
      {item.label}
    </Link>
  );
}

export default function AdminShell({ email, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-brand-light lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-brand-dark/5 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-brand-dark/5 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4z" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-base font-semibold text-brand-dark">
            {CLINIC.shortName} Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} searchParams={searchParams} />
          ))}
        </nav>

        <div className="border-t border-brand-dark/5 p-4">
          <Link
            href="/"
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-dark/60 transition-colors hover:bg-brand-dark/5 hover:text-brand-dark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10 6 4 12l6 6M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View site
          </Link>
          <div className="flex items-center justify-between rounded-xl bg-brand-light px-3 py-2.5">
            <span className="truncate text-xs text-brand-dark/50" title={email}>{email}</span>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-brand-dark/40 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-16 items-center justify-between border-b border-brand-dark/5 bg-white px-6 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4z" fill="currentColor" />
              </svg>
            </span>
            <span className="font-display text-base font-semibold text-brand-dark">
              {CLINIC.shortName} Admin
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-brand-dark/10 px-3 py-1.5 text-xs font-medium text-brand-dark/70 transition-colors hover:border-red-300 hover:text-red-600"
          >
            Log out
          </button>
        </header>

        {/* Mobile quick-nav */}
        <div className="flex gap-2 overflow-x-auto border-b border-brand-dark/5 bg-white px-4 py-3 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, searchParams);
            return (
              <Link
                key={item.label}
                href={buildHref(item)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-brand-blue text-white'
                    : 'bg-brand-dark/5 text-brand-dark/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
