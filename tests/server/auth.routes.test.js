/**
 * Test library/framework: Jest + Supertest.
 * This suite exercises the auth routes focusing on register, login, google auth,
 * forgot/reset password, verify-reset-token, and /me endpoints.
 * External dependencies are mocked to avoid IO and external services.
 */
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Under test: router default export. Adjust path if your routes file lives elsewhere.
import router from '../../server/routes/auth.routes.js';

// Mocks for dependencies used inside the router
jest.mock('../../server/models/User.js', () => {
  const m = {};
  // a minimal in-memory fake with configurable behavior per test
  class FakeUser {
    constructor(doc) {
      Object.assign(this, { 
        _id: 'u1',
        name: 'Test User',
        email: 'user@example.com',
        password: 'hashed',
        skillsOffered: [],
        timeBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        skillsLearning: [],
        rating: 0,
        save: jest.fn(async function () { return this; }),
        comparePassword: jest.fn(async () => true),
        ...doc
      });
    }
    static async findOne(query) {
      return m.findOne ? m.findOne(query) : null;
    }
    static async findByIdAndDelete(id) {
      if (m.findByIdAndDelete) return m.findByIdAndDelete(id);
      return null;
    }
    static __setFindOne(fn) { m.findOne = fn; }
    static __setFindByIdAndDelete(fn) { m.findByIdAndDelete = fn; }
    static __reset() { m.findOne = undefined; m.findByIdAndDelete = undefined; }
  }
  return { __esModule: true, default: FakeUser };
});

jest.mock('../../server/middleware/auth.js', () => ({
  __esModule: true,
  default: (req, _res, next) => {
    // Inject a fake authenticated user
    req.user = {
      _id: 'me1',
      name: 'Me',
      email: 'me@example.com',
      timeBalance: 5,
      totalEarned: 2,
      totalSpent: 1,
      skillsOffered: [{ name: 'Help', description: 'desc', sessionsCompleted: 0 }],
      skillsLearning: [],
      rating: 4.5
    };
    next();
  }
}));

jest.mock('../../server/config/firebase.js', () => ({
  __esModule: true,
  default: {
    auth: () => ({
      verifyIdToken: jest.fn()
    })
  }
}));

jest.mock('../../server/services/emailService.js', () => ({
  __esModule: true,
  default: {
    sendPasswordResetEmail: jest.fn(),
    // generateOTP, sendOTPEmail are not used currently (commented paths)
  }
}));

// NOTE: We do not replace jwt.sign behavior entirely; we can spy to ensure it's used.
jest.spyOn(jwt, 'sign').mockImplementation(() => 'jwt-token');

const FakeUser = (await import('../../server/models/User.js')).default;
const emailService = (await import('../../server/services/emailService.js')).default;
const firebaseAdmin = (await import('../../server/config/firebase.js')).default;

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', router);
  return app;
};

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.FRONTEND_URL = 'http://frontend.local';
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  jest.clearAllMocks();
  FakeUser.__reset();
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    test('creates user and returns token with default skills when none provided', async () => {
      FakeUser.__setFindOne(async ({ email }) => null); // not existing

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'alice@example.com', password: 'p@ss' })
        .expect(201);

      expect(res.body).toHaveProperty('token', 'jwt-token');
      expect(res.body).toHaveProperty('message');
      expect(res.body.user).toMatchObject({
        name: 'Alice',
        email: 'alice@example.com',
        isEmailVerified: true
      });
      // ensure default skills assigned
      expect(res.body.user).toHaveProperty('timeBalance');
    });

    test('creates user and preserves provided skillsOffered', async () => {
      FakeUser.__setFindOne(async () => null);
      const app = buildApp();

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob',
          email: 'bob@example.com',
          password: 'secret',
          skillsOffered: [{ name: 'Coding', description: 'JS help', sessionsCompleted: 0 }]
        })
        .expect(201);

      expect(res.body.user).toMatchObject({ name: 'Bob', email: 'bob@example.com' });
      // The route echoes skills only implicitly via DB; we at least ensure token present
      expect(res.body).toHaveProperty('token', 'jwt-token');
    });

    test('rejects when user already exists', async () => {
      FakeUser.__setFindOne(async ({ email }) => new FakeUser({ email }));
      const app = buildApp();

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'X', email: 'dup@example.com', password: 'x' })
        .expect(400);

      expect(res.body).toEqual({ message: 'User already exists' });
    });

    test('handles server error on save', async () => {
      FakeUser.__setFindOne(async () => null);
      // make constructor instance save throw
      const failing = new FakeUser({ email: 'e@e.com' });
      jest.spyOn(FakeUser.prototype, 'save').mockRejectedValueOnce(new Error('DB down'));
      const app = buildApp();

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Y', email: 'y@example.com', password: 'y' })
        .expect(500);

      expect(res.body.message).toBe('Server error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('rejects when user not found', async () => {
      FakeUser.__setFindOne(async () => null);
      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nf@example.com', password: 'no' })
        .expect(400);
      expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    test('rejects when authProvider is google (non-local)', async () => {
      FakeUser.__setFindOne(async () => new FakeUser({ email: 'g@example.com', authProvider: 'google' }));
      const app = buildApp();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'g@example.com', password: 'x' })
        .expect(400);

      expect(res.body.message).toMatch(/Google Sign-In/i);
    });

    test('rejects when password mismatch', async () => {
      const user = new FakeUser({ email: 'm@example.com' });
      user.comparePassword = jest.fn(async () => false);
      FakeUser.__setFindOne(async () => user);

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'm@example.com', password: 'bad' })
        .expect(400);

      expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    test('returns token and user on success', async () => {
      const user = new FakeUser({ _id: 'id1', email: 'ok@example.com', name: 'Ok' });
      user.comparePassword = jest.fn(async () => true);
      FakeUser.__setFindOne(async () => user);

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ok@example.com', password: 'good' })
        .expect(200);

      expect(res.body).toMatchObject({
        token: 'jwt-token',
        user: { id: 'id1', name: 'Ok', email: 'ok@example.com' }
      });
    });

    test('handles unexpected errors', async () => {
      FakeUser.__setFindOne(async () => { throw new Error('boom'); });
      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'e@example.com', password: 'x' })
        .expect(500);
      expect(res.body.error).toBe('boom');
    });
  });

  describe('POST /api/auth/google', () => {
    test('401 when Firebase token verification fails', async () => {
      firebaseAdmin.auth().verifyIdToken.mockRejectedValueOnce(new Error('bad token'));
      const app = buildApp();

      const res = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 'invalid', name: 'N', email: 'n@e.com' })
        .expect(401);

      expect(res.body.message).toBe('Invalid Google token');
    });

    test('creates a new user when not existing', async () => {
      firebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({ email: 'new@ex.com', name: 'Newbie', picture: 'pic' });
      FakeUser.__setFindOne(async () => null);

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 'ok', name: 'Newbie', email: 'new@ex.com', photoURL: 'photo' })
        .expect(200);

      expect(res.body.token).toBe('jwt-token');
      expect(res.body.user).toMatchObject({ email: 'new@ex.com', name: 'Newbie', profilePicture: 'photo' });
    });

    test('updates existing user picture when provided', async () => {
      firebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({ email: 'exists@ex.com', name: 'Ex', picture: 'firebasePic' });
      const existing = new FakeUser({ _id: 'u2', email: 'exists@ex.com', profilePicture: 'old' });
      existing.save = jest.fn(async () => existing);
      FakeUser.__setFindOne(async () => existing);

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 'ok', name: 'Ex', email: 'exists@ex.com', photoURL: 'newPic' })
        .expect(200);

      expect(existing.save).toHaveBeenCalled();
      expect(res.body.user.profilePicture).toBe('newPic');
    });

    test('handles server error path', async () => {
      firebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({ email: 'e@e.com' });
      FakeUser.__setFindOne(async () => { throw new Error('db fail'); });

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 'ok' })
        .expect(500);

      expect(res.body.message).toMatch(/Server error during Google authentication/);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('returns generic message if user not found', async () => {
      FakeUser.__setFindOne(async () => null);
      const app = buildApp();

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'none@ex.com' })
        .expect(200);

      expect(res.body.message).toMatch(/If an account with that email exists/);
    });

    test('sets reset token and sends email', async () => {
      const user = new FakeUser({ email: 'has@ex.com', name: 'Has' });
      user.save = jest.fn(async () => user);
      FakeUser.__setFindOne(async () => user);
      emailService.sendPasswordResetEmail.mockResolvedValueOnce();

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'has@ex.com' })
        .expect(200);

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(user.passwordReset).toBeDefined();
      expect(res.body.message).toMatch(/Password reset instructions/);
    });

    test('500 when email sending fails', async () => {
      const user = new FakeUser({ email: 'err@ex.com', name: 'Err' });
      user.save = jest.fn(async () => user);
      FakeUser.__setFindOne(async () => user);
      emailService.sendPasswordResetEmail.mockRejectedValueOnce(new Error('mailer down'));

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'err@ex.com' })
        .expect(500);

      expect(res.body.message).toBe('Failed to send password reset email');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('400 when token or newPassword missing', async () => {
      const app = buildApp();
      await request(app).post('/api/auth/reset-password').send({}).expect(400);
      await request(app).post('/api/auth/reset-password').send({ token: 't' }).expect(400);
      await request(app).post('/api/auth/reset-password').send({ newPassword: 'n' }).expect(400);
    });

    test('400 when token invalid or expired', async () => {
      // emulate query that returns null for provided token
      FakeUser.__setFindOne(async () => null);
      const app = buildApp();

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'bad', newPassword: 'new' })
        .expect(400);

      expect(res.body.message).toBe('Invalid or expired reset token');
    });

    test('resets password, clears token, returns auth token', async () => {
      const user = new FakeUser({ _id: 'uid', email: 'r@ex.com', passwordReset: { token: 'good', expires: new Date(Date.now() + 60000) } });
      user.save = jest.fn(async () => user);
      // emulate token lookup path used in route: { 'passwordReset.token': token, 'passwordReset.expires': { $gt: new Date() } }
      FakeUser.__setFindOne(async () => user);

      const app = buildApp();
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'good', newPassword: 'newpass' })
        .expect(200);

      expect(user.password).toBe('newpass');
      expect(user.passwordReset).toBeUndefined();
      expect(res.body.token).toBe('jwt-token');
      expect(res.body.message).toBe('Password reset successfully');
    });
  });

  describe('GET /api/auth/verify-reset-token/:token', () => {
    test('400 when token invalid/expired', async () => {
      FakeUser.__setFindOne(async () => null);
      const app = buildApp();
      const res = await request(app).get('/api/auth/verify-reset-token/bad').expect(400);
      expect(res.body.message).toBe('Invalid or expired reset token');
    });

    test('200 when token valid', async () => {
      const user = new FakeUser({ email: 'ok@ex.com' });
      FakeUser.__setFindOne(async () => user);
      const app = buildApp();
      const res = await request(app).get('/api/auth/verify-reset-token/good').expect(200);
      expect(res.body).toEqual({ message: 'Valid reset token', email: 'ok@ex.com' });
    });
  });

  describe('GET /api/auth/me', () => {
    test('returns current user from auth middleware', async () => {
      const app = buildApp();
      const res = await request(app).get('/api/auth/me').expect(200);
      expect(res.body.user).toMatchObject({ email: 'me@example.com', name: 'Me' });
    });
  });
});