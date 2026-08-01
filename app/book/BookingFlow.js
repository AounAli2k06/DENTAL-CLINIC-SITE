'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES, CLINIC, formatPKR } from '@/src/lib/constants';
import { toDateKey, parseDateKeyLocal } from '@/src/lib/dateUtils';
import { safeJson } from '@/src/lib/http';

const STEPS = ['Service & Date', 'Time Slot', 'Your Details', 'Confirmation'];

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

function StepIndicator({ current }) {
  return (
    <div className="mx-auto mb-10 flex max-w-2xl items-center justify-between">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                i < current
                  ? 'bg-brand-teal text-white'
                  : i === current
                  ? 'bg-brand-blue text-white'
                  : 'bg-white text-brand-dark/30 border border-brand-dark/10'
              }`}
            >
              {i < current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="hidden text-xs text-brand-dark/50 sm:block">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-2 h-0.5 flex-1 transition-colors duration-300 ${
                i < current ? 'bg-brand-teal' : 'bg-brand-dark/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BookingFlowInner() {
  const searchParams = useSearchParams();
  const days = useMemo(() => getNextDays(14), []);

  const [step, setStep] = useState(0);
  const [service, setService] = useState(
    SERVICES.find((s) => s.id === searchParams.get('service'))?.id || SERVICES[0].id
  );
  const [date, setDate] = useState(searchParams.get('date') || toDateKey(days[0]));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [slotsRetryToken, setSlotsRetryToken] = useState(0);
  const [timeSlot, setTimeSlot] = useState(searchParams.get('slot') || null);

  const [form, setForm] = useState({ patientName: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const selectedService = SERVICES.find((s) => s.id === service);

  useEffect(() => {
    if (step !== 1) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError('');

    fetch(`/api/appointments/available-slots?date=${date}`)
      .then(async (res) => {
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.error || 'Failed to load available times.');
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        const newSlots = data.slots || [];
        setSlots(newSlots);
        // Only clear the selected slot if it's no longer actually available —
        // don't wipe out a slot the user (or a shared link) already picked.
        setTimeSlot((current) => {
          if (!current) return current;
          const stillAvailable = newSlots.some((s) => s.time === current && s.available);
          return stillAvailable ? current : null;
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(err.message || 'Failed to load available times.');
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, step, slotsRetryToken]);

  const validateDetails = () => {
    const next = {};
    if (!form.patientName.trim()) next.patientName = 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.phone.trim().length < 7) next.phone = 'Enter a valid phone number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateDetails()) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: form.patientName,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          service: selectedService.name,
          date,
          timeSlot,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
        if (res.status === 409) {
          setStep(1);
        }
        return;
      }

      setConfirmedAppointment(data.appointment);
      setEmailSent(Boolean(data.emailSent));
      setStep(3);
    } catch (err) {
      setSubmitError(
        err.message || 'Network error. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buildCalendarLink = () => {
    if (!confirmedAppointment) return '#';
    const [time, meridiem] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const start = parseDateKeyLocal(date);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + selectedService.duration * 60000);

    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${selectedService.name} — BrightSmile Dental`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Appointment for ${selectedService.name} at BrightSmile Dental Studio.`,
      location: `${CLINIC.address.street}, ${CLINIC.address.city}, ${CLINIC.address.region} ${CLINIC.address.postalCode}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="container-page max-w-3xl">
      <div className="mb-10 text-center">
        <span className="section-eyebrow">Book Appointment</span>
        <h1 className="mt-3 font-display text-3xl font-medium text-brand-dark sm:text-4xl">
          Reserve your visit
        </h1>
      </div>

      <StepIndicator current={step} />

      <div className="rounded-3xl border border-brand-dark/5 bg-white p-6 shadow-card sm:p-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-xl font-medium text-brand-dark">
                Choose your service
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setService(s.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      service === s.id
                        ? 'border-brand-teal bg-brand-teal/5'
                        : 'border-brand-dark/10 hover:border-brand-teal/50'
                    }`}
                  >
                    <p className="font-medium text-brand-dark">{s.name}</p>
                    <p className="mt-1 text-sm text-brand-dark/50">
                      {formatPKR(s.price)} · {s.duration} min
                    </p>
                  </button>
                ))}
              </div>

              <h2 className="mt-8 font-display text-xl font-medium text-brand-dark">
                Choose a date
              </h2>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {days.map((d) => {
                  const iso = toDateKey(d);
                  const isSelected = iso === date;
                  return (
                    <button
                      key={iso}
                      onClick={() => setDate(iso)}
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

              <button onClick={() => setStep(1)} className="btn-primary mt-8 w-full">
                Continue
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-xl font-medium text-brand-dark">
                Pick a time slot
              </h2>
              <p className="mt-1 text-sm text-brand-dark/50">
                {parseDateKeyLocal(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>

              {slotsLoading ? (
                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-11 animate-pulse rounded-lg bg-brand-dark/5" />
                  ))}
                </div>
              ) : slotsError ? (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-4 text-sm text-red-600">
                  <p>{slotsError}</p>
                  <button
                    onClick={() => setSlotsRetryToken((t) => t + 1)}
                    className="mt-2 font-semibold underline underline-offset-2"
                  >
                    Try again
                  </button>
                </div>
              ) : slots.length === 0 ? (
                <p className="mt-5 rounded-xl bg-brand-dark/5 px-4 py-4 text-sm text-brand-dark/50">
                  No times available for this day. Please choose a different date.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setTimeSlot(slot.time)}
                      className={`rounded-lg px-2 py-3 text-sm font-medium transition-colors ${
                        !slot.available
                          ? 'cursor-not-allowed bg-brand-dark/5 text-brand-dark/25 line-through'
                          : timeSlot === slot.time
                          ? 'bg-brand-blue text-white'
                          : 'border border-brand-dark/10 bg-white text-brand-dark/70 hover:border-brand-blue'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!timeSlot}
                  className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-xl font-medium text-brand-dark">
                Your details
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-brand-dark/10 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none"
                    placeholder="Jane Doe"
                  />
                  {errors.patientName && (
                    <p className="mt-1 text-xs text-red-500">{errors.patientName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-brand-dark/10 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none"
                    placeholder="jane@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-brand-dark/10 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none"
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-brand-dark/10 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none"
                    placeholder="Anything we should know before your visit?"
                  />
                </div>
              </div>

              {submitError && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </p>
              )}

              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Confirming…' : 'Confirm Appointment'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && confirmedAppointment && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-5 font-display text-2xl font-medium text-brand-dark">
                You&rsquo;re all set, {form.patientName.split(' ')[0]}!
              </h2>
              <p className="mt-2 text-sm text-brand-dark/60">
                {emailSent
                  ? `A confirmation email is on its way to ${form.email}.`
                  : "We've saved your appointment — a confirmation email will follow shortly."}
              </p>

              <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-brand-light p-6 text-left text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-brand-dark/50">Service</span>
                  <span className="font-medium text-brand-dark">{selectedService.name}</span>
                </div>
                <div className="flex justify-between border-t border-brand-dark/5 py-2">
                  <span className="text-brand-dark/50">Date</span>
                  <span className="font-medium text-brand-dark">
                    {parseDateKeyLocal(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-brand-dark/5 py-2">
                  <span className="text-brand-dark/50">Time</span>
                  <span className="font-medium text-brand-dark">{timeSlot}</span>
                </div>
                <div className="flex justify-between border-t border-brand-dark/5 py-2">
                  <span className="text-brand-dark/50">Status</span>
                  <span className="font-medium capitalize text-amber-600">
                    {confirmedAppointment.status}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href={buildCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Add to Calendar
                </a>
                <a href="/" className="btn-primary">
                  Return Home
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <Suspense fallback={null}>
      <BookingFlowInner />
    </Suspense>
  );
}
