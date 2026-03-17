import { describe, expect, it } from 'vitest';

import { FixedClock } from '../../lib/time/fixed-clock.js';
import {
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  SessionExpiredError,
  SessionRevokedError,
} from '../../lib/errors/auth-errors.js';
import { FakePasswordHasher } from '../../lib/security/fake-password-hasher.js';
import { FakeTokenService } from '../../lib/security/fake-token-service.js';
import { InMemorySessionRepository } from '../sessions/in-memory-session-repository.js';
import { InMemoryUserRepository } from '../users/in-memory-user-repository.js';
import { AuthService } from './auth-service.js';
import { hashRefreshToken } from './refresh-token-digester.js';

const buildSubject = async () => {
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

  return {
    clock,
    passwordHasher,
    service: new AuthService({
      clock,
      passwordHasher,
      sessionRepository,
      tokenService,
      userRepository,
    }),
    sessionRepository,
    tokenService,
  };
};

describe('AuthService', () => {
  it('authenticates an active user with valid credentials', async () => {
    const { service, tokenService } = await buildSubject();

    const result = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    expect(result.tokenType).toBe('Bearer');
    expect(result.refreshToken).toBeTruthy();
    await expect(tokenService.readAccessToken(result.accessToken)).resolves.toMatchObject({
      email: 'active@example.com',
      sub: 'user-active',
    });
  });

  it('rejects an unknown email', async () => {
    const { service } = await buildSubject();

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'secret-123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('rejects an invalid password', async () => {
    const { service } = await buildSubject();

    await expect(
      service.login({
        email: 'active@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('rejects an inactive user', async () => {
    const { service } = await buildSubject();

    await expect(
      service.login({
        email: 'inactive@example.com',
        password: 'secret-456',
      }),
    ).rejects.toBeInstanceOf(InactiveUserError);
  });

  it('rotates refresh tokens on refresh', async () => {
    const { service, sessionRepository } = await buildSubject();
    const loginResult = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    const previousHash = hashRefreshToken(loginResult.refreshToken);
    const previousSession = await sessionRepository.findByRefreshTokenHash(previousHash);

    const refreshResult = await service.refresh({
      refreshToken: loginResult.refreshToken,
    });

    expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken);
    expect(await sessionRepository.findByRefreshTokenHash(previousHash)).toBeNull();
    await expect(
      sessionRepository.findById(previousSession?.id ?? ''),
    ).resolves.toMatchObject({
      id: previousSession?.id,
    });
  });

  it('rejects a refresh token after it has been rotated', async () => {
    const { service } = await buildSubject();
    const loginResult = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    await service.refresh({
      refreshToken: loginResult.refreshToken,
    });

    await expect(
      service.refresh({
        refreshToken: loginResult.refreshToken,
      }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it('rejects an expired session', async () => {
    const { clock, service } = await buildSubject();
    const loginResult = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    clock.set(new Date('2026-03-25T12:00:00.000Z'));

    await expect(
      service.refresh({
        refreshToken: loginResult.refreshToken,
      }),
    ).rejects.toBeInstanceOf(SessionExpiredError);
  });

  it('rejects a revoked session', async () => {
    const { service } = await buildSubject();
    const loginResult = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    await service.logout({
      refreshToken: loginResult.refreshToken,
    });

    await expect(
      service.refresh({
        refreshToken: loginResult.refreshToken,
      }),
    ).rejects.toBeInstanceOf(SessionRevokedError);
  });

  it('revokes an existing session on logout', async () => {
    const { service } = await buildSubject();
    const loginResult = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    await expect(
      service.logout({
        refreshToken: loginResult.refreshToken,
      }),
    ).resolves.toBeUndefined();
  });

  it('returns the authenticated context from a valid access token', async () => {
    const { service } = await buildSubject();
    const loginResult = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    const context = await service.me(loginResult.accessToken);

    expect(context.user).toMatchObject({
      email: 'active@example.com',
      id: 'user-active',
    });
  });

  it('rejects me when the session was revoked', async () => {
    const { service } = await buildSubject();
    const loginResult = await service.login({
      email: 'active@example.com',
      password: 'secret-123',
    });

    await service.logout({
      refreshToken: loginResult.refreshToken,
    });

    await expect(service.me(loginResult.accessToken)).rejects.toBeInstanceOf(SessionRevokedError);
  });
});

