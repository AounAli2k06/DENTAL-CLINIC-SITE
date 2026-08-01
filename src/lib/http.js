/**
 * Safely parse a fetch Response as JSON.
 *
 * Without this, calling `res.json()` on a response that isn't actually JSON
 * (a Next.js HTML error page from a crashed route, a 404 page, a proxy
 * timeout page, etc.) throws a raw parser error like:
 *   "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
 * which tells the user nothing about what actually went wrong on the server.
 *
 * This reads the body as text first, checks the content-type, and produces
 * an actionable message pointing at the real problem (usually: the server
 * crashed — check the terminal running `npm run dev` / your deploy logs).
 */
export async function safeJson(res) {
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    const preview = text.slice(0, 120).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Server returned an unexpected response (HTTP ${res.status}) instead of JSON. ` +
        `This usually means the API route crashed — check the terminal running your ` +
        `dev server for the real error.${preview ? ` Response started with: "${preview}"` : ''}`
    );
  }

  return res.json();
}
