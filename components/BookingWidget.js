'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ScrollReveal from './ScrollReveal';
import Dropdown from './Dropdown';
import { SERVICES, formatPKR } from '@/src/lib/constants';
import { toDateKey } from '@/src/lib/dateUtils';
import { safeJson } from '@/src/lib/http';

function getNextDays(count) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function BookingWidget() {
  const router = useRouter();
  const days = useMemo(() => getNextDays(10), []);
  const [selectedService, setSelectedService] = useState(SERVICES[0].id);
  const [selectedDate, setSelectedDate] = useState(toDateKey(days[0]));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setSelectedSlot(null);

    fetch(`/api/appointments/available-slots?date=${selectedDate}`)
      .then(async (res) => {
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.error || 'Failed to load available times.');
        return data;
      })
      .then((data) => {
        if (!cancelled) setSlots(data.slots || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setSlots([]);
          setError(err.message || 'Failed to load available times.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, retryToken]);

  const handleContinue = () => {
    const params = new URLSearchParams({
      service: selectedService,
      date: selectedDate,
    });
    if (selectedSlot) params.set('slot', selectedSlot);
    router.push(`/book?${params.toString()}`);
  };

  return (
    <section className="bg-white py-24">
      <div className="container-page">
        <ScrollReveal className="text-center">
          <span className="section-eyebrow">Book in under two minutes</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-brand-dark sm:text-4xl">
            Find a time that works for you.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-brand-dark/5 bg-brand-light p-6 shadow-card sm:p-8">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                Service
              </label>
              <Dropdown
                value={selectedService}
                onChange={setSelectedService}
                options={SERVICES.map((s) => ({
                  value: s.id,
                  label: `${s.name} — ${formatPKR(s.price)}`,
                }))}
                triggerClassName="mt-2 w-full rounded-xl border border-brand-dark/10 bg-white px-4 py-3 text-sm text-brand-dark hover:border-brand-teal/50 focus:border-brand-teal focus:outline-none"
              />
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                Date
              </label>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {days.map((d) => {
                  const iso = toDateKey(d);
                  const isSelected = iso === selectedDate;
                  return (
                    <button
                      key={iso}
                      onClick={() => setSelectedDate(iso)}
                      className={`flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'border-brand-teal bg-brand-teal text-white'
                          : 'border-brand-dark/10 bg-white text-brand-dark/70 hover:border-brand-teal'
                      }`}
                    >
                      <span className="text-[10px] uppercase opacity-70">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="font-semibold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                Time slot
              </label>
              {loading ? (
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-brand-dark/5" />
                  ))}
                </div>
              ) : error ? (
                <div className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}{' '}
                  <button
                    onClick={() => setRetryToken((t) => t + 1)}
                    className="font-semibold underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              ) : slots.length === 0 ? (
                <p className="mt-2 rounded-lg bg-brand-dark/5 px-4 py-3 text-sm text-brand-dark/50">
                  No times available for this day. Try another date.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`rounded-lg px-2 py-2.5 text-xs font-medium transition-colors ${
                        !slot.available
                          ? 'cursor-not-allowed bg-brand-dark/5 text-brand-dark/25 line-through'
                          : selectedSlot === slot.time
                          ? 'bg-brand-blue text-white'
                          : 'border border-brand-dark/10 bg-white text-brand-dark/70 hover:border-brand-blue'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedSlot}
              className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to Your Details
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
