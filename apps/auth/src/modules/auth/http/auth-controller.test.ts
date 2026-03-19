import { beforeEach, describe, expect, it } from 'vitest';

import { FixedClock } from '../../../lib/time/fixed-clock.js';
import { FakePasswordHasher } from '../../../lib/security/fake-password-hasher.js';
import { FakeTokenService } from '../../../lib/security/fake-token-service.js';
import { InMemorySessionRepository } from '../../sessions/in-memory-session-repository.js';
import { InMemoryUserRepository } from '../../users/in-memory-user-repository.js';
import { AuthService } from '../auth-service.js';
import {
  createLoginHandler,
  createLogoutHandler,
  createMeHandler,
  createRefreshHandler,
} from './create-auth-router.js';

const buildTestContext = async () => {
  const passwordHasher = new FakePasswordHasher();
  const activePasswordHash = await passwordHasher.hash('secret-123');
  const inactivePasswordHash = await passwordHasher.hash('secret-456');
  const clock = new FixedClock(new Date('2026-03-17T12:00:00.000Z'));

  const userRepository = new InMemoryUserRepository([
    {
      email: 'active@example.com',
      id: 'user-active',
      isActive: true,
      passwordHash: activePasswordHash,
    },
    {
      email: 'inactive@example.com',
      id: 'user-inactive',
      isActive: false,
      passwordHash: inactivePasswordHash,
    },
  ]);

  const sessionRepository = new InMemorySessionRepository();
  const tokenService = new FakeTokenService();
  const authService = new AuthService({
    clock,
    passwordHasher,
    sessionRepository,
    tokenService,
    userRepository,
  });

  return {
    authService,
    clock,
    passwordHasher,
    sessionRepository,
    tokenService,
  };
};

type AuthSuccessPayload = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    email: string;
    id: string;
    isActive: boolean;
  };
};

type ErrorPayload = {
  error: string;
  message: string;
};

const createResponseRecorder = () => {
  const state: {
    body: unknown;
    statusCode: number | null;
  } = {
    body: null,
    statusCode: null,
  };

  return {
    response: {
      status(code: number) {
        state.statusCode = code;

        return {
          json(payload: unknown) {
            state.body = payload;
            return payload;
          },
          send() {
            state.body = null;
            return null;
          },
        };
      },
    },
    state,
  };
};

describe('Auth HTTP endpoints', () => {
  let authService: AuthService;
  let clock: FixedClock;

  beforeEach(async () => {
    const context = await buildTestContext();
    authService = context.authService;
    clock = context.clock;
  });

  describe('POST /auth/login', () => {
    it('returns 200 with accessToken, refreshToken, tokenType, expiresIn and user for valid credentials', async () => {
      const handler = createLoginHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            email: 'active@example.com',
            password: 'secret-123',
          },
        },
        response,
      );

      const payload = state.body as AuthSuccessPayload;

      expect(state.statusCode).toBe(200);
      expect(payload).toMatchObject({
        expiresIn: 900,
        tokenType: 'Bearer',
        user: {
          email: 'active@example.com',
          id: 'user-active',
          isActive: true,
        },
      });
      expect(payload.accessToken).toEqual(expect.any(String));
      expect(payload.refreshToken).toEqual(expect.any(String));
    });

    it('returns 400 when email is missing or invalid', async () => {
      const handler = createLoginHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            email: 'not-an-email',
            password: 'secret-123',
          },
        },
        response,
      );

      expect(state.statusCode).toBe(400);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'validation_error',
      });
    });

    it('returns 400 when password is missing', async () => {
      const handler = createLoginHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            email: 'active@example.com',
          },
        },
        response,
      );

      expect(state.statusCode).toBe(400);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'validation_error',
      });
    });

    it('returns 401 for invalid credentials', async () => {
      const handler = createLoginHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            email: 'active@example.com',
            password: 'wrong-password',
          },
        },
        response,
      );

      expect(state.statusCode).toBe(401);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'invalid_credentials',
      });
    });

    it('returns 403 when the user is inactive', async () => {
      const handler = createLoginHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            email: 'inactive@example.com',
            password: 'secret-456',
          },
        },
        response,
      );

      expect(state.statusCode).toBe(403);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'inactive_user',
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns 200 with a new access token and a rotated refresh token', async () => {
      const loginResult = await authService.login({
        email: 'active@example.com',
        password: 'secret-123',
      });
      const handler = createRefreshHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            refreshToken: loginResult.refreshToken,
          },
        },
        response,
      );

      const payload = state.body as AuthSuccessPayload;

      expect(state.statusCode).toBe(200);
      expect(payload.refreshToken).toEqual(expect.any(String));
      expect(payload.refreshToken).not.toBe(loginResult.refreshToken);
      expect(payload.accessToken).toEqual(expect.any(String));
    });

    it('returns 400 when refreshToken is missing', async () => {
      const handler = createRefreshHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {},
        },
        response,
      );

      expect(state.statusCode).toBe(400);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'validation_error',
      });
    });

    it('returns 401 when refreshToken is invalid', async () => {
      const handler = createRefreshHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            refreshToken: 'invalid-token',
          },
        },
        response,
      );

      expect(state.statusCode).toBe(401);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'invalid_refresh_token',
      });
    });

    it('returns 403 when the session is expired', async () => {
      const loginPayload = await authService.login({
        email: 'active@example.com',
        password: 'secret-123',
      });
      const handler = createRefreshHandler({ authService });
      const { response, state } = createResponseRecorder();

      clock.set(new Date('2026-03-25T12:00:00.000Z'));

      await handler(
        {
          body: {
            refreshToken: loginPayload.refreshToken,
          },
        },
        response,
      );

      expect(state.statusCode).toBe(403);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'session_expired',
      });
    });

    it('returns 403 when the session is revoked', async () => {
      const loginPayload = await authService.login({
        email: 'active@example.com',
        password: 'secret-123',
      });
      const handler = createRefreshHandler({ authService });
      const { response, state } = createResponseRecorder();

      await authService.logout({
        refreshToken: loginPayload.refreshToken,
      });

      await handler(
        {
          body: {
            refreshToken: loginPayload.refreshToken,
          },
        },
        response,
      );

      expect(state.statusCode).toBe(403);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'session_revoked',
      });
    });

    it('invalidates the previous refresh token after successful rotation', async () => {
      const loginPayload = await authService.login({
        email: 'active@example.com',
        password: 'secret-123',
      });
      const handler = createRefreshHandler({ authService });
      const firstResponse = createResponseRecorder();
      const staleResponse = createResponseRecorder();

      await handler(
        {
          body: {
            refreshToken: loginPayload.refreshToken,
          },
        },
        firstResponse.response,
      );

      const refreshPayload = firstResponse.state.body as AuthSuccessPayload;

      await handler(
        {
          body: {
            refreshToken: loginPayload.refreshToken,
          },
        },
        staleResponse.response,
      );

      expect(refreshPayload.refreshToken).not.toBe(loginPayload.refreshToken);
      expect(staleResponse.state.statusCode).toBe(401);
      expect(staleResponse.state.body as ErrorPayload).toMatchObject({
        error: 'invalid_refresh_token',
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 204 when the current session is revoked', async () => {
      const loginPayload = await authService.login({
        email: 'active@example.com',
        password: 'secret-123',
      });
      const handler = createLogoutHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            refreshToken: loginPayload.refreshToken,
          },
        },
        response,
      );

      expect(state.statusCode).toBe(204);
      expect(state.body).toBeNull();
    });

    it('returns 400 when refreshToken is missing', async () => {
      const handler = createLogoutHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {},
        },
        response,
      );

      expect(state.statusCode).toBe(400);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'validation_error',
      });
    });

    it('keeps logout idempotent when the session no longer exists', async () => {
      const handler = createLogoutHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          body: {
            refreshToken: 'missing-refresh-token',
          },
        },
        response,
      );

      expect(state.statusCode).toBe(204);
      expect(state.body).toBeNull();
    });
  });

  describe('GET /auth/me', () => {
    it('returns 200 with the authenticated user for a valid access token', async () => {
      const loginPayload = await authService.login({
        email: 'active@example.com',
        password: 'secret-123',
      });
      const handler = createMeHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          headers: {
            authorization: `Bearer ${loginPayload.accessToken}`,
          },
        },
        response,
      );

      expect(state.statusCode).toBe(200);
      expect(state.body).toMatchObject({
        email: 'active@example.com',
        id: 'user-active',
        isActive: true,
      });
    });

    it('returns 401 when Authorization header is missing', async () => {
      const handler = createMeHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler({}, response);

      expect(state.statusCode).toBe(401);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'invalid_access_token',
      });
    });

    it('returns 401 when the access token is invalid', async () => {
      const handler = createMeHandler({ authService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          headers: {
            authorization: 'Bearer invalid-token',
          },
        },
        response,
      );

      expect(state.statusCode).toBe(401);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'invalid_access_token',
      });
    });

    it('returns 403 when the session is revoked', async () => {
      const loginPayload = await authService.login({
        email: 'active@example.com',
        password: 'secret-123',
      });
      const handler = createMeHandler({ authService });
      const { response, state } = createResponseRecorder();

      await authService.logout({
        refreshToken: loginPayload.refreshToken,
      });

      await handler(
        {
          headers: {
            authorization: `Bearer ${loginPayload.accessToken}`,
          },
        },
        response,
      );

      expect(state.statusCode).toBe(403);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'session_revoked',
      });
    });

    it('returns 403 when the user is inactive', async () => {
      const inactiveContext = await buildTestContext();
      const inactiveUserRepository = new InMemoryUserRepository([
        {
          email: 'active@example.com',
          id: 'user-active',
          isActive: false,
          passwordHash: await inactiveContext.passwordHasher.hash('secret-123'),
        },
      ]);
      const inactiveAuthService = new AuthService({
        clock,
        passwordHasher: inactiveContext.passwordHasher,
        sessionRepository: inactiveContext.sessionRepository,
        tokenService: inactiveContext.tokenService,
        userRepository: inactiveUserRepository,
      });
      const session = await inactiveContext.sessionRepository.create({
        expiresAt: new Date('2026-03-24T12:00:00.000Z'),
        refreshTokenHash: 'hashed-refresh-token',
        userId: 'user-active',
      });
      const accessToken = await inactiveContext.tokenService.createAccessToken({
        email: 'active@example.com',
        sessionId: session.id,
        sub: 'user-active',
      });
      const handler = createMeHandler({ authService: inactiveAuthService });
      const { response, state } = createResponseRecorder();

      await handler(
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
        response,
      );

      expect(state.statusCode).toBe(403);
      expect(state.body as ErrorPayload).toMatchObject({
        error: 'inactive_user',
      });
    });
  });
});
