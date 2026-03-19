import { FakePasswordHasher } from '../../../lib/security/fake-password-hasher.js';
import { FakeTokenService } from '../../../lib/security/fake-token-service.js';
import { SystemClock } from '../../../lib/time/system-clock.js';
import { InMemorySessionRepository } from '../../sessions/in-memory-session-repository.js';
import { AuthService } from '../auth-service.js';
import { InMemoryUserRepository } from '../../users/in-memory-user-repository.js';

export const createDevelopmentAuthService = async () => {
  const passwordHasher = new FakePasswordHasher();

  const activeUserPassword = process.env.AUTH_ACTIVE_PASSWORD ?? 'secret-123';
  const inactiveUserPassword = process.env.AUTH_INACTIVE_PASSWORD ?? 'secret-456';

  const userRepository = new InMemoryUserRepository([
    {
      email: process.env.AUTH_ACTIVE_EMAIL ?? 'active@example.com',
      id: 'user-active',
      isActive: true,
      passwordHash: await passwordHasher.hash(activeUserPassword),
    },
    {
      email: process.env.AUTH_INACTIVE_EMAIL ?? 'inactive@example.com',
      id: 'user-inactive',
      isActive: false,
      passwordHash: await passwordHasher.hash(inactiveUserPassword),
    },
  ]);

  return new AuthService({
    clock: new SystemClock(),
    passwordHasher,
    sessionRepository: new InMemorySessionRepository(),
    tokenService: new FakeTokenService(),
    userRepository,
  });
};

