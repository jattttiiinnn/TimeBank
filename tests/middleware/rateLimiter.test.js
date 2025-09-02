/**
 * Tests for apiLimiter middleware (express-rate-limit config).
 *
 * Testing framework: Jest + Supertest (preferred). If Jest isn't configured, adapt to the project's runner.
 */
const path = require('path');

let request;
let express;
let apiLimiter;

const buildApp = () => {
  const app = express();
  // mount the limiter specifically on a test route
  app.use('/limited', apiLimiter);
  app.get('/limited/ok', (req, res) => res.status(200).json({ ok: true }));
  app.post('/limited/data', (req, res) => res.status(201).json({ created: true }));
  // An OPTIONS preflight route: should be skipped by limiter
  app.options('/limited/preflight', (req, res) => res.sendStatus(204));
  return app;
};

describe('apiLimiter middleware', () => {
  beforeAll(() => {
    // Defer requires to allow projects without these deps to fail fast with clear messages.
    try {
      request = require('supertest');
    } catch (e) {
      throw new Error('supertest is required for these tests. Please add supertest to devDependencies.');
    }
    try {
      express = require('express');
    } catch (e) {
      throw new Error('express is required for these tests.');
    }

    // Import the middleware under test.
    // Try common locations; adjust if your middleware path differs.
    // Prefer ESM default export transpiled for CJS; fallback require default if present.
    let mod;
    const candidatePaths = [
      // Common source locations
      'src/middleware/rateLimiter.js',
      'server/middleware/rateLimiter.js',
      'middleware/rateLimiter.js',
      // If tests provided the code within tests path (less likely)
      'tests/middleware/rateLimiter.js',
    ];
    let found = null;
    for (const rel of candidatePaths) {
      try {
        const p = path.resolve(process.cwd(), rel);
        // eslint-disable-next-line import/no-dynamic-require, global-require
        mod = require(p);
        found = p;
        break;
      } catch (e) {
        // ignore and continue
      }
    }
    if (!mod) {
      throw new Error('Could not locate rateLimiter middleware. Ensure it exists at src/middleware/rateLimiter.js or update test import path.');
    }
    apiLimiter = mod.default || mod;
  });

  test('exports a function (Express middleware signature)', () => {
    expect(typeof apiLimiter).toBe('function');
    // Should accept (req, res, next)
    expect(apiLimiter.length).toBe(3);
  });

  describe('behavior under normal usage', () => {
    let app;
    beforeEach(() => {
      app = buildApp();
    });

    test('allows a request under the limit and reaches the route handler', async () => {
      const res = await request(app).get('/limited/ok');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    test('applies standard rate limit headers when enabled (RateLimit-* present, X-RateLimit-* absent)', async () => {
      const res = await request(app).get('/limited/ok');
      // Standard headers (per express-rate-limit `standardHeaders: true`)
      // Values may vary; we assert presence and numeric form where reasonable.
      const stdLimit = res.headers['ratelimit-limit'];
      const stdRemaining = res.headers['ratelimit-remaining'];
      // Legacy headers disabled (legacyHeaders: false)
      const legacyLimit = res.headers['x-ratelimit-limit'];
      expect(stdLimit).toBeDefined();
      expect(stdRemaining).toBeDefined();
      expect(legacyLimit).toBeUndefined();
    });

    test('skips counting for OPTIONS preflight (should not reduce remaining quota)', async () => {
      // First, GET once to establish baseline headers
      const first = await request(app).get('/limited/ok');
      const beforeRemaining = Number(first.headers['ratelimit-remaining']);

      // Send multiple OPTIONS requests that should be skipped
      await request(app).options('/limited/preflight').expect(204);
      await request(app).options('/limited/preflight').expect(204);
      await request(app).options('/limited/preflight').expect(204);

      // Another GET; remaining should decrement by 1 compared to baseline (only the two GETs count)
      const after = await request(app).get('/limited/ok');
      const afterRemaining = Number(after.headers['ratelimit-remaining']);
      // Allow >= 0 checks in case other parallel tests mutate the same store, but assert non-aggressive drop
      expect(Number.isNaN(beforeRemaining)).toBe(false);
      expect(Number.isNaN(afterRemaining)).toBe(false);
      // Remaining should not have dropped by more than 1 between the two GETs
      expect(beforeRemaining - afterRemaining).toBeGreaterThanOrEqual(0);
      expect(beforeRemaining - afterRemaining).toBeLessThanOrEqual(1);
    });
  });

  describe('when exceeding the limit', () => {
    let app;
    beforeEach(() => {
      app = buildApp();
    });

    test('responds with 429 and configured JSON body', async () => {
      // Flood more than the configured max for the test window.
      // We don't know `max` at runtime here; send a conservative number to trigger blocking.
      let blocked = null;
      for (let i = 0; i < 105; i += 1) {
        const res = await request(app).get('/limited/ok');
        if (res.status === 429) {
          blocked = res;
          break;
        }
      }
      expect(blocked).not.toBeNull();
      expect(blocked.status).toBe(429);
      // Assert shape of the configured message
      expect(blocked.body).toEqual({
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes',
      });
      // Also confirm standard header indicating total and remaining are present on 429
      expect(blocked.headers['ratelimit-limit']).toBeDefined();
      expect(blocked.headers['ratelimit-remaining']).toBeDefined();
      // And legacy headers absent
      expect(blocked.headers['x-ratelimit-limit']).toBeUndefined();
    });

    test('continues to block subsequent requests within the window', async () => {
      // Force trip the limiter
      let hitLimit = false;
      for (let i = 0; i < 200; i += 1) {
        const res = await request(app).post('/limited/data');
        if (res.status === 429) {
          hitLimit = true;
          break;
        }
      }
      expect(hitLimit).toBe(true);

      // Immediate follow-up should still be blocked
      const again = await request(app).post('/limited/data');
      expect(again.status).toBe(429);
      expect(again.body).toMatchObject({
        status: 'error',
        message: expect.stringContaining('Too many requests'),
      });
    });
  });

  describe('type safety and unexpected input handling', () => {
    test('middleware safely handles malformed req objects (calls next with error or responds)', async () => {
      // Directly invoke middleware with a minimal mock
      const req = { method: 'GET', ip: '1.2.3.4', headers: {} };
      const res = {
        statusCode: 200,
        headers: {},
        status(code) { this.statusCode = code; return this; },
        set(field, value) { this.headers[field.toLowerCase()] = value; return this; },
        json(payload) { this.payload = payload; return this; },
        end() { this.ended = true; },
      };
      const next = jest.fn();
      // The rate limiter may access symbols set by Express; we mainly assert it doesn't throw synchronously.
      expect(() => apiLimiter(req, res, next)).not.toThrow();
    });
  });
});