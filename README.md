# BrightSmile Dental Studio — Full-Stack Website & Booking Platform

A production-ready Next.js (App Router) dental practice website for Karachi,
Pakistan — with a live appointment booking system, email confirmations, and
a protected admin dashboard, backed by MongoDB/Mongoose.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server + Client Components)
- **Styling:** Tailwind CSS, Framer Motion for animation
- **Database:** MongoDB via Mongoose (cached connection pattern for serverless)
- **Auth:** JWT session cookie (httpOnly) — `jose` for Edge middleware verification,
  `jsonwebtoken` for Node-runtime signing, `bcryptjs` for password hashing
- **Email:** Resend (booking confirmations + status-change notifications)
- **SEO:** Metadata API, OpenGraph tags, JSON-LD `Dentist` schema with live
  aggregate rating, sitemap.xml, robots.txt
- **Testing:** Vitest (unit tests for date/timezone logic and error handling)

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # fill in the values — see below
npm run create-admin                # creates your admin login
npm run seed-appointments           # optional: populates example bookings
npm run dev
```

Visit `http://localhost:3000` for the site, `/book` to test the booking
flow, and `/admin/login` for the dashboard.

## Environment Variables

All documented with inline comments in `.env.local.example`. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | Full Atlas (or local) connection string. Must include the cluster's random suffix, e.g. `cluster0.ab12cde.mongodb.net` — `cluster0.mongodb.net` alone will fail DNS resolution. |
| `JWT_SECRET` | Yes | Long random string used to sign admin session cookies. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Yes (for `create-admin`) | Seeds the first admin user. Re-run `npm run create-admin` after changing these to update the existing admin's password. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Used for metadata, OpenGraph, canonical URLs, JSON-LD. Set to your real production domain before deploying. |
| `GMAIL_USER` | No | Gmail address emails are sent from. Without this + `GMAIL_APP_PASSWORD` set, bookings still work — the app just logs a warning and skips sending. |
| `GMAIL_APP_PASSWORD` | No | A 16-character App Password (not your real Gmail password) — generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), requires 2-Step Verification enabled first. Free, no domain required, ~500 emails/day limit. |

## Scripts

```bash
npm run dev               # local dev server
npm run build              # production build
npm start                  # run the production build
npm run create-admin       # seed/update the admin user
npm run seed-appointments  # populate ~30-40 example appointments across the last 30 days (safe to re-run)
npm test                   # run the Vitest suite
```

## Directory Structure

```
dental-practice/
├── app/
│   ├── layout.js                          # Root layout: metadata, viewport, JSON-LD Dentist schema
│   ├── page.js                            # Homepage
│   ├── globals.css
│   ├── sitemap.js / robots.js
│   ├── book/
│   │   ├── page.js
│   │   └── BookingFlow.js                 # 4-step client booking flow
│   ├── admin/
│   │   ├── login/page.js                  # Public login (not inside the protected group)
│   │   └── (protected)/
│   │       ├── layout.js                  # Server-side session check + redirect
│   │       ├── page.js                    # Renders <Dashboard />
│   │       └── stats/
│   │           ├── page.js
│   │           └── Analytics.js           # 30-day chart, revenue estimate, service popularity
│   └── api/
│       ├── appointments/
│       │   ├── route.js                   # POST create (public) / GET list+metrics (admin)
│       │   ├── [id]/route.js              # PATCH status (+ triggers status email) / DELETE
│       │   ├── available-slots/route.js   # GET open slots for a date (public)
│       │   └── stats/route.js             # GET aggregated analytics (admin)
│       └── auth/
│           ├── login/route.js
│           └── logout/route.js
├── components/
│   ├── Navbar.js, Hero.js, Services.js, About.js, Testimonials.js,
│   │   BookingWidget.js, Footer.js, ScrollReveal.js, FAQ.js, WhatsAppButton.js
│   ├── Dropdown.js                        # Custom portal-based select (used in booking + admin)
│   ├── MotionProvider.js                  # Makes all Framer Motion respect prefers-reduced-motion
│   └── admin/
│       ├── AdminShell.js                  # Sidebar nav (URL-driven filters), mobile quick-nav
│       ├── Dashboard.js                   # Live-polls every 20s, pauses when tab is hidden
│       ├── AppointmentsTable.js, MetricCard.js, StatusBadge.js
│       ├── DailyChart.js                  # Dependency-free SVG bar chart
│       └── ServiceBreakdownChart.js
├── src/
│   ├── lib/
│   │   ├── mongodb.js                     # Cached Mongoose connection (serverless-safe)
│   │   ├── auth.js                        # JWT sign/verify + httpOnly cookie helpers
│   │   ├── dateUtils.js                   # Timezone-safe date handling — see note below
│   │   ├── email.js                       # Gmail SMTP (Nodemailer) — booking + status-change emails
│   │   ├── http.js                        # safeJson() — readable errors on non-JSON responses
│   │   ├── constants.js                   # Clinic info, services/pricing (PKR), time slots
│   │   └── __tests__/                     # Vitest unit tests
│   └── models/
│       ├── Appointment.js                 # Includes the double-booking-prevention unique index
│       └── User.js
├── middleware.js                          # Edge-runtime auth guard for /admin/*
├── scripts/
│   ├── createAdmin.js
│   └── seedAppointments.js
└── vitest.config.mjs
```

## Architecture Notes

**The admin dashboard updates live without a manual reload — via polling,
not websockets, on purpose.** `Dashboard.js` re-fetches every 20 seconds and
pauses entirely while the browser tab isn't visible (via the
`visibilitychange` event), so it's not burning API calls — and serverless
function invocations — on a backgrounded tab. Websockets/SSE were
deliberately skipped: Vercel's serverless functions aren't designed for
long-lived connections, so polling is actually the more reliable choice
here, not just the simpler one.

**Auth is two-layered on purpose.** `middleware.js` runs on the Edge runtime
and bounces unauthenticated requests before any page code executes. The
`(protected)` layout then re-verifies server-side with the full
`jsonwebtoken` library. If one layer is ever bypassed, the other still
catches it.

**Date/timezone handling lives entirely in `src/lib/dateUtils.js`.** This
existed because of a real bug: naive `date.toISOString().split('T')[0]`
conversions silently shift the calendar date depending on the user's
timezone. The fix treats `"YYYY-MM-DD"` strings as the source of truth —
built from local calendar fields on the client, anchored to UTC boundaries
on the server, and the clinic's actual timezone (`Asia/Karachi`, set in
`constants.js`) governs whether a time slot has already passed — not the
server's or the browser's timezone. This is covered by regression tests in
`src/lib/__tests__/dateUtils.test.js`.

**Double-booking prevention is two-layered too.** An application-level
check in `POST /api/appointments` handles the common case; a MongoDB
partial unique index on `{ date, timeSlot }` (scoped to `pending`/`confirmed`
statuses only) is the actual database-enforced guarantee against race
conditions. See `src/models/Appointment.js`.

**Emails never block or fail the action that triggered them.** Both
`sendBookingConfirmationEmail` and `sendStatusUpdateEmail` in
`src/lib/email.js` are deliberately non-throwing — an appointment that's
already saved to MongoDB is the source of truth, and a Resend outage should
never roll that back.

## Testing

```bash
npm test
```

27 unit tests covering the date/timezone utilities (including the exact
scenarios that caused real bugs during development), PKR price formatting,
and the `safeJson` error-handling helper. These are Node-environment unit
tests for pure logic — there is no database-integration or browser
end-to-end test suite yet. If you add one, `mongodb-memory-server` (for
integration tests against a real in-memory Mongo instance) and
Playwright/Cypress (for E2E) are the natural next additions.

## Deployment Checklist

Before pushing to production:

- [ ] Set every variable in the Environment Variables table above on your
      host (Vercel/etc.) — especially `NEXT_PUBLIC_SITE_URL` pointing at
      your real domain, not `localhost`.
- [ ] Run `npm run create-admin` against your **production** database, not
      just locally — the admin user has to exist in whichever MongoDB
      instance production actually connects to.
- [ ] In MongoDB Atlas → Network Access, allowlist your hosting provider's
      IPs (or `0.0.0.0/0` if using serverless functions with dynamic IPs).
- [ ] **If using Atlas Free (M0) tier:** it auto-pauses after 30 days of
      zero database activity, which will silently break the entire site
      until someone manually resumes it in the Atlas dashboard. Either set
      up a scheduled ping to your `/api/appointments/available-slots`
      endpoint to keep it active, or upgrade to Flex/M10+ for anything
      that needs to stay reliably up.
- [ ] Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` — a normal Gmail App
      Password works fine (~500 emails/day), no domain purchase needed.
- [ ] Add real `og-image.jpg` and `favicon.ico` files to `/public` — both
      are referenced in metadata but aren't included yet.
- [ ] Consider adding rate limiting to `/api/appointments` (POST) and
      `/api/auth/login` — neither is currently throttled.
