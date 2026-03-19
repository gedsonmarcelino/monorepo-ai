import type { TAuthSession } from '../../contracts/auth.type.js';

export interface ISessionRepository {
  create(input: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }): Promise<TAuthSession>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<TAuthSession | null>;
  findById(id: string): Promise<TAuthSession | null>;
  rotate(input: {
    sessionId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    lastUsedAt: Date;
  }): Promise<TAuthSession>;
  revoke(sessionId: string, revokedAt: Date): Promise<void>;
}

