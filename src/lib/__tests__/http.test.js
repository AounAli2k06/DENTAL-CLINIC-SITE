import { describe, it, expect } from 'vitest';
import { safeJson } from '../http';

function fakeResponse({ status, contentType, body }) {
  return {
    status,
    headers: { get: (name) => (name === 'content-type' ? contentType : null) },
    json: async () => JSON.parse(body),
    text: async () => body,
  };
}

describe('safeJson', () => {
  it('parses a real JSON response normally', async () => {
    const res = fakeResponse({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, value: 42 }),
    });
    const data = await safeJson(res);
    expect(data).toEqual({ ok: true, value: 42 });
  });

  it('throws a readable error instead of a raw parser crash on HTML responses', async () => {
    // This is the exact bug the user hit: a crashed API route returning
    // Next.js's HTML error page, which used to surface as
    // "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" with zero
    // indication of what actually went wrong.
    const res = fakeResponse({
      status: 500,
      contentType: 'text/html; charset=utf-8',
      body: '<!DOCTYPE html><html><body>Internal Server Error</body></html>',
    });

    await expect(safeJson(res)).rejects.toThrow(/HTTP 500/);
  });

  it('includes a preview of the actual response body in the error', async () => {
    const res = fakeResponse({
      status: 502,
      contentType: 'text/plain',
      body: 'Bad gateway from upstream proxy',
    });

    await expect(safeJson(res)).rejects.toThrow(/Bad gateway from upstream proxy/);
  });
});
