'use client';

import { useState, useEffect, useCallback } from 'react';
import MetricCard from '@/components/admin/MetricCard';
import DailyChart from '@/components/admin/DailyChart';
import ServiceBreakdownChart from '@/components/admin/ServiceBreakdownChart';
import { safeJson } from '@/src/lib/http';
import { formatPKR } from '@/src/lib/constants';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments/stats');
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || 'Failed to load analytics.');
        return;
      }
      setStats(data);
    } catch (err) {
      setError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, retryToken]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/70" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
        <p>{error}</p>
        <button
          onClick={() => setRetryToken((t) => t + 1)}
          className="mt-2 font-semibold underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  const revenueChange =
    stats.revenue.lastMonth > 0
      ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100
      : stats.revenue.thisMonth > 0
      ? 100
      : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-medium text-brand-dark">Analytics</h1>
        <p className="mt-1 text-sm text-brand-dark/50">
          Booking trends, revenue, and service popularity at a glance.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="This Month's Bookings" value={stats.thisMonthBookings} tone="blue" />
        <MetricCard
          label="Est. Revenue This Month"
          value={formatPKR(stats.revenue.thisMonth)}
          tone="teal"
        />
        <MetricCard
          label="Est. Revenue Last Month"
          value={formatPKR(stats.revenue.lastMonth)}
        />
        <MetricCard
          label="Vs. Last Month"
          value={`${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(0)}%`}
          tone={revenueChange >= 0 ? 'teal' : 'amber'}
        />
        <MetricCard label="Cancellation Rate" value={`${stats.cancellationRate.toFixed(1)}%`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-dark/5 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="font-display text-lg font-medium text-brand-dark">
            Bookings — last 30 days
          </h2>
          <div className="mt-6">
            <DailyChart data={stats.dailyCounts} />
          </div>
        </div>

        <div className="rounded-2xl border border-brand-dark/5 bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-medium text-brand-dark">
            Popular services
          </h2>
          <div className="mt-6">
            <ServiceBreakdownChart data={stats.serviceBreakdown} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-brand-dark/5 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-medium text-brand-dark">Status breakdown</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(stats.statusBreakdown).map(([status, count]) => (
            <div key={status} className="rounded-xl bg-brand-light p-4 text-center">
              <p className="font-display text-2xl font-medium text-brand-dark">{count}</p>
              <p className="mt-1 text-xs capitalize text-brand-dark/50">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
