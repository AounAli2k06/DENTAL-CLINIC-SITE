'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MetricCard from './MetricCard';
import AppointmentsTable from './AppointmentsTable';
import { safeJson } from '@/src/lib/http';

const VIEW_TITLES = {
  all: 'All appointments',
  pending: 'Pending appointments',
  confirmed: 'Confirmed appointments',
  completed: 'Completed appointments',
  cancelled: 'Cancelled appointments',
};

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The sidebar drives status/date through the URL — that's the single
  // source of truth for those two filters, so the same view is shareable
  // and the sidebar's active-state highlighting always matches what's shown.
  const status = searchParams.get('status') || 'all';
  const date = searchParams.get('date') || '';

  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, confirmed: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (date) params.set('date', date);
    if (search) params.set('search', search);

    try {
      const res = await fetch(`/api/appointments?${params.toString()}`);

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await safeJson(res);

      if (!res.ok) {
        setLoadError(data.error || 'Failed to load appointments.');
        return;
      }

      setAppointments(data.appointments || []);
      setMetrics(data.metrics || { total: 0, pending: 0, confirmed: 0, today: 0 });
    } catch (err) {
      setLoadError(err.message || 'Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [status, date, search, router]);

  useEffect(() => {
    const t = setTimeout(fetchData, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchData, search, retryToken]);

  function updateDateFilter(newDate) {
    const params = new URLSearchParams(searchParams.toString());
    if (newDate) params.set('date', newDate);
    else params.delete('date');
    router.push(`/admin?${params.toString()}`);
  }

  async function handleStatusChange(id, newStatus) {
    setActionError('');
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Failed to update this appointment.');
        return;
      }

      fetchData();
    } catch (err) {
      setActionError('Could not reach the server. The status was not updated.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this appointment? This cannot be undone.')) return;
    setActionError('');
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Failed to delete this appointment.');
        return;
      }

      fetchData();
    } catch (err) {
      setActionError('Could not reach the server. The appointment was not deleted.');
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-medium text-brand-dark">Dashboard overview</h1>
        <p className="mt-1 text-sm text-brand-dark/50">Manage bookings and track your schedule at a glance.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Bookings"
          value={metrics.total}
          tone="blue"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/70">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        />
        <MetricCard
          label="Pending"
          value={metrics.pending}
          tone="amber"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/70">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        />
        <MetricCard
          label="Confirmed"
          value={metrics.confirmed}
          tone="teal"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/70">
              <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <MetricCard
          label="Today's Appointments"
          value={metrics.today}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-brand-dark/30">
              <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-brand-dark/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-medium text-brand-dark">
          {VIEW_TITLES[status] || 'Appointments'}
        </h2>
        <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:items-center">
          <input
            type="text"
            placeholder="Search by patient name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-brand-dark/15 px-3 py-2 text-sm focus:border-brand-teal sm:w-48"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => updateDateFilter(e.target.value)}
            className="w-full rounded-lg border border-brand-dark/15 px-3 py-2 text-sm focus:border-brand-teal sm:w-auto"
          />
          {(date || status !== 'all' || search) && (
            <button
              onClick={() => { updateDateFilter(''); setSearch(''); router.push('/admin'); }}
              className="whitespace-nowrap text-sm font-medium text-brand-dark/50 hover:text-brand-teal"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-5">
        {loadError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
            <p>{loadError}</p>
            <button
              onClick={() => setRetryToken((t) => t + 1)}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : (
          <AppointmentsTable
            appointments={appointments}
            loading={loading}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
