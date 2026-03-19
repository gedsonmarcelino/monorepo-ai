import type {
  TAuthContext,
  TAuthTokenPayload,
  TLoginInput,
  TLoginResult,
  TRefreshInput,
} from '../../contracts/auth.type.js';
import {
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  SessionExpiredError,
  SessionRevokedError,
} from '../../lib/errors/auth-errors.js';
import type { TAuthServiceDependencies } from './auth-service-dependencies.type.js';
import { hashRefreshToken } from './refresh-token-digester.js';

const refreshTokenTtlInDays = 7;

export class AuthService {
  constructor(private readonly dependencies: TAuthServiceDependencies) {}

  async login(input: TLoginInput): Promise<TLoginResult> {
    const user = await this.dependencies.userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.dependencies.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new InactiveUserError();
    }

    return this.issueSession({
      email: user.email,
      userId: user.id,
    });
  }

  async refresh(input: TRefreshInput): Promise<TLoginResult> {
    const refreshTokenHash = hashRefreshToken(input.refreshToken);
    const session = await this.dependencies.sessionRepository.findByRefreshTokenHash(refreshTokenHash);

    if (!session) {
      throw new InvalidRefreshTokenError();
    }

    if (session.revokedAt) {
      throw new SessionRevokedError();
    }

    const now = this.dependencies.clock.now();

    if (session.expiresAt <= now) {
      throw new SessionExpiredError();
    }

    const user = await this.dependencies.userRepository.findById(session.userId);

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    if (!user.isActive) {
      throw new InactiveUserError();
    }

    const refreshToken = await this.dependencies.tokenService.createRefreshToken();
    const nextRefreshTokenHash = hashRefreshToken(refreshToken);
    const nextExpiresAt = addDays(now, refreshTokenTtlInDays);

    const rotatedSession = await this.dependencies.sessionRepository.rotate({
      sessionId: session.id,
      refreshTokenHash: nextRefreshTokenHash,
      expiresAt: nextExpiresAt,
      lastUsedAt: now,
    });

    const accessToken = await this.dependencies.tokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      sessionId: rotatedSession.id,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.dependencies.tokenService.accessTokenTtlInSeconds,
      user: {
        email: user.email,
        id: user.id,
        isActive: user.isActive,
      },
    };
  }

  async logout(input: TRefreshInput): Promise<void> {
    const refreshTokenHash = hashRefreshToken(input.refreshToken);
    const session = await this.dependencies.sessionRepository.findByRefreshTokenHash(refreshTokenHash);

    if (!session) {
      return;
    }

    await this.dependencies.sessionRepository.revoke(session.id, this.dependencies.clock.now());
  }

  async me(accessToken: string): Promise<TAuthContext> {
    const payload = await this.dependencies.tokenService.readAccessToken(accessToken);
    const session = await this.dependencies.sessionRepository.findById(payload.sessionId);

    if (!session) {
      throw new InvalidRefreshTokenError();
    }

    if (session.revokedAt) {
      throw new SessionRevokedError();
    }

    const user = await this.dependencies.userRepository.findById(payload.sub);

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    if (!user.isActive) {
      throw new InactiveUserError();
    }

    return {
      session,
      user: {
        email: user.email,
        id: user.id,
        isActive: user.isActive,
      },
    };
  }

  private async issueSession(input: {
    email: string;
    userId: string;
  }): Promise<TLoginResult> {
    const now = this.dependencies.clock.now();
    const refreshToken = await this.dependencies.tokenService.createRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await this.dependencies.sessionRepository.create({
      expiresAt: addDays(now, refreshTokenTtlInDays),
      refreshTokenHash,
      userId: input.userId,
    });

    const payload: TAuthTokenPayload = {
      email: input.email,
      sessionId: session.id,
      sub: input.userId,
    };
    const accessToken = await this.dependencies.tokenService.createAccessToken(payload);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.dependencies.tokenService.accessTokenTtlInSeconds,
      user: {
        email: input.email,
        id: input.userId,
        isActive: true,
      },
    };
  }
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
