import { Resend } from 'resend';
import { CLINIC, formatPKR } from './constants';
import { dayBoundsFromKey } from './dateUtils';

let resendClient = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
}

/**
 * Low-level send wrapper shared by every email this app sends. Deliberately
 * non-throwing for the same reason as the booking-confirmation flow: a
 * notification email failing should never roll back or fail the action
 * (booking, status change, etc.) that triggered it.
 */
async function sendEmail({ to, subject, html, text }) {
  const client = getResendClient();

  if (!client) {
    console.warn(
      `RESEND_API_KEY is not set — skipping email "${subject}" to ${to}. ` +
        'Add RESEND_API_KEY to .env.local to enable real email delivery.'
    );
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const { error } = await client.emails.send({
      from: `${CLINIC.name} <${getFromAddress()}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend API returned an error:', error);
      return { sent: false, reason: 'resend_error', error };
    }

    return { sent: true };
  } catch (err) {
    console.error(`Failed to send email "${subject}":`, err);
    return { sent: false, reason: 'exception', error: err };
  }
}

function formatDisplayDate(dateKey) {
  const bounds = dayBoundsFromKey(dateKey);
  const date = bounds ? bounds.start : new Date(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function buildHtml({ patientName, service, dateKey, timeSlot, price, notes }) {
  const displayDate = formatDisplayDate(dateKey);

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background-color:#1e40af;padding:28px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:600;">${CLINIC.shortName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:9999px;background-color:#0d948820;margin-bottom:16px;">
                  <span style="color:#0d9488;font-size:24px;">&#10003;</span>
                </div>
                <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a;">Thanks, ${escapeHtml(patientName.split(' ')[0])} — we've got your request</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
                  Your appointment at ${escapeHtml(CLINIC.name)} has been received. Here are the details:
                </p>
                <table role="presentation" width="100%" style="background-color:#f8fafc;border-radius:14px;padding:8px 20px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;">Service</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;">${escapeHtml(service)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Date</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${escapeHtml(displayDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Time</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${escapeHtml(timeSlot)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Estimated cost</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${escapeHtml(formatPKR(price))}</td>
                  </tr>
                  ${notes ? `<tr><td style="padding:10px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Notes</td><td style="padding:10px 0;font-size:13px;color:#0f172a;text-align:right;border-top:1px solid #e2e8f0;">${escapeHtml(notes)}</td></tr>` : ''}
                </table>
                <p style="margin:0 0 4px;font-size:13px;color:#64748b;">${escapeHtml(CLINIC.address.street)}, ${escapeHtml(CLINIC.address.city)}</p>
                <p style="margin:0 0 24px;font-size:13px;color:#64748b;">Questions? Call us at ${escapeHtml(CLINIC.phone)}</p>
                <p style="margin:0;font-size:12px;color:#94a3b8;">Your booking status is currently <strong>pending</strong> — our front desk will confirm it shortly.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildText({ patientName, service, dateKey, timeSlot, price, notes }) {
  const displayDate = formatDisplayDate(dateKey);
  return [
    `Thanks, ${patientName.split(' ')[0]} — we've got your request`,
    '',
    `Your appointment at ${CLINIC.name} has been received.`,
    '',
    `Service: ${service}`,
    `Date: ${displayDate}`,
    `Time: ${timeSlot}`,
    `Estimated cost: ${formatPKR(price)}`,
    notes ? `Notes: ${notes}` : null,
    '',
    `${CLINIC.address.street}, ${CLINIC.address.city}`,
    `Questions? Call us at ${CLINIC.phone}`,
    '',
    'Your booking status is currently pending — our front desk will confirm it shortly.',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Sends the patient a booking confirmation email via Resend.
 *
 * Deliberately non-throwing: if RESEND_API_KEY isn't set, or the Resend API
 * call fails for any reason (bad key, sandbox domain restrictions, etc.),
 * this logs the problem and resolves — it never blocks or fails the booking
 * itself. An appointment that was successfully saved to the database should
 * not be lost just because the notification email couldn't be sent.
 */
export async function sendBookingConfirmationEmail({
  to,
  patientName,
  service,
  dateKey,
  timeSlot,
  price,
  notes,
}) {
  return sendEmail({
    to,
    subject: `Appointment request received — ${service} on ${formatDisplayDate(dateKey)}`,
    html: buildHtml({ patientName, service, dateKey, timeSlot, price, notes }),
    text: buildText({ patientName, service, dateKey, timeSlot, price, notes }),
  });
}

const STATUS_COPY = {
  confirmed: {
    subjectPrefix: 'Appointment confirmed',
    heading: (name) => `Good news, ${name} — you're confirmed!`,
    body:
      "Your appointment has been confirmed by our front desk. We look forward to seeing you.",
  },
  cancelled: {
    subjectPrefix: 'Appointment cancelled',
    heading: (name) => `${name}, your appointment has been cancelled`,
    body:
      "Your appointment below has been cancelled. If this wasn't expected, or you'd like to " +
      'rebook for another time, just give us a call.',
  },
  completed: {
    subjectPrefix: 'Thanks for visiting',
    heading: (name) => `Thank you for visiting, ${name}!`,
    body:
      'Your appointment is now marked complete. We hope you\u2019re happy with your visit — ' +
      "reach out any time if you have questions about your treatment.",
  },
  pending: {
    subjectPrefix: 'Appointment update',
    heading: (name) => `${name}, your appointment status was updated`,
    body: 'Your appointment has been moved back to pending review by our front desk.',
  },
};

function buildStatusHtml({ patientName, service, dateKey, timeSlot, status }) {
  const displayDate = formatDisplayDate(dateKey);
  const copy = STATUS_COPY[status] || STATUS_COPY.pending;
  const firstName = escapeHtml(patientName.split(' ')[0]);

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background-color:#1e40af;padding:28px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:600;">${escapeHtml(CLINIC.shortName)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a;">${copy.heading(firstName)}</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">${escapeHtml(copy.body)}</p>
                <table role="presentation" width="100%" style="background-color:#f8fafc;border-radius:14px;padding:8px 20px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;">Service</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;">${escapeHtml(service)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Date</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${escapeHtml(displayDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Time</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;border-top:1px solid #e2e8f0;">${escapeHtml(timeSlot)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;">Status</td>
                    <td style="padding:10px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right;text-transform:capitalize;border-top:1px solid #e2e8f0;">${escapeHtml(status)}</td>
                  </tr>
                </table>
                <p style="margin:0 0 4px;font-size:13px;color:#64748b;">${escapeHtml(CLINIC.address.street)}, ${escapeHtml(CLINIC.address.city)}</p>
                <p style="margin:0;font-size:13px;color:#64748b;">Questions? Call us at ${escapeHtml(CLINIC.phone)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildStatusText({ patientName, service, dateKey, timeSlot, status }) {
  const displayDate = formatDisplayDate(dateKey);
  const copy = STATUS_COPY[status] || STATUS_COPY.pending;
  const firstName = patientName.split(' ')[0];

  return [
    copy.heading(firstName),
    '',
    copy.body,
    '',
    `Service: ${service}`,
    `Date: ${displayDate}`,
    `Time: ${timeSlot}`,
    `Status: ${status}`,
    '',
    `${CLINIC.address.street}, ${CLINIC.address.city}`,
    `Questions? Call us at ${CLINIC.phone}`,
  ].join('\n');
}

/**
 * Sends the patient an email whenever the admin changes an appointment's
 * status (confirmed / cancelled / completed / back to pending). Same
 * non-throwing contract as sendBookingConfirmationEmail — a notification
 * failure must never undo or block the status change that already saved
 * successfully to the database.
 */
export async function sendStatusUpdateEmail({
  to,
  patientName,
  service,
  dateKey,
  timeSlot,
  status,
}) {
  const copy = STATUS_COPY[status] || STATUS_COPY.pending;

  return sendEmail({
    to,
    subject: `${copy.subjectPrefix} — ${service} on ${formatDisplayDate(dateKey)}`,
    html: buildStatusHtml({ patientName, service, dateKey, timeSlot, status }),
    text: buildStatusText({ patientName, service, dateKey, timeSlot, status }),
  });
}
