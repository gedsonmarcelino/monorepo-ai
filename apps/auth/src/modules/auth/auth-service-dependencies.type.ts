import type { IPasswordHasher } from '../../lib/security/password-hasher.type.js';
import type { ITokenService } from '../../lib/security/token-service.type.js';
import type { IClock } from '../../lib/time/clock.type.js';
import type { ISessionRepository } from '../sessions/session-repository.type.js';
import type { IUserRepository } from '../users/user-repository.type.js';

export type TAuthServiceDependencies = {
  clock: IClock;
  passwordHasher: IPasswordHasher;
  sessionRepository: ISessionRepository;
  tokenService: ITokenService;
  userRepository: IUserRepository;
};

