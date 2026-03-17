import type { AuthSession } from '../../contracts/auth.js';

export interface SessionRepository {
  create(input: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }): Promise<AuthSession>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSession | null>;
  findById(id: string): Promise<AuthSession | null>;
  rotate(input: {
    sessionId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    lastUsedAt: Date;
  }): Promise<AuthSession>;
  revoke(sessionId: string, revokedAt: Date): Promise<void>;
}

