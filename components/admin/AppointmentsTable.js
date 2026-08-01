'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import Dropdown from '@/components/Dropdown';

const STATUS_FLOW = ['pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_OPTIONS = STATUS_FLOW.map((s) => ({
  value: s,
  label: `Mark ${s.charAt(0).toUpperCase()}${s.slice(1)}`,
}));

export default function AppointmentsTable({ appointments, loading, onStatusChange, onDelete }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleChange = async (id, status) => {
    setUpdatingId(id);
    await onStatusChange(id, status);
    setUpdatingId(null);
  };

  const handleDelete = async (id) => {
    setUpdatingId(id);
    await onDelete(id);
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-white/70" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-dark/15 bg-white/50 p-12 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-brand-dark/20">
          <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-brand-dark/50">
          No appointments match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-dark/5 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-brand-dark/5 bg-brand-light/60 text-xs uppercase tracking-wide text-brand-dark/50">
            <tr>
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Date &amp; Time</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/5">
            {appointments.map((appt, i) => (
              <tr
                key={appt._id}
                className={`transition-colors hover:bg-brand-light/60 ${i % 2 === 1 ? 'bg-brand-light/20' : ''}`}
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-brand-dark">{appt.patientName}</p>
                  {appt.notes && (
                    <p className="mt-0.5 max-w-[180px] truncate text-xs text-brand-dark/40" title={appt.notes}>
                      {appt.notes}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 text-brand-dark/70">{appt.service}</td>
                <td className="px-5 py-4 text-brand-dark/70">
                  {/* timeZone: 'UTC' matters here — appt.date is stored as UTC
                      midnight of the calendar day the patient picked. Without
                      pinning the timezone, toLocaleDateString renders it in
                      the admin's local timezone, which can silently shift
                      the displayed date by a day. */}
                  {new Date(appt.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                  <span className="block text-xs text-brand-dark/40">{appt.timeSlot}</span>
                </td>
                <td className="px-5 py-4 text-brand-dark/70">
                  <p className="text-xs">{appt.email}</p>
                  <p className="text-xs text-brand-dark/40">{appt.phone}</p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={appt.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Dropdown
                      value={appt.status}
                      disabled={updatingId === appt._id}
                      onChange={(status) => handleChange(appt._id, status)}
                      options={STATUS_OPTIONS}
                      triggerClassName="rounded-lg border border-brand-dark/10 px-2.5 py-1.5 text-xs text-brand-dark/70 hover:border-brand-teal/50 focus:border-brand-teal focus:outline-none"
                    />
                    <button
                      onClick={() => handleDelete(appt._id)}
                      disabled={updatingId === appt._id}
                      aria-label="Delete appointment"
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-brand-dark/30 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1A2 2 0 0 1 14.2 21H9.8a2 2 0 0 1-2-1.9L7 7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
