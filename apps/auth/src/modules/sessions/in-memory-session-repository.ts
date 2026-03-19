import { randomUUID } from 'node:crypto';

import type { TAuthSession } from '../../contracts/auth.type.js';
import type { ISessionRepository } from './session-repository.type.js';

export class InMemorySessionRepository implements ISessionRepository {
  private readonly sessions: TAuthSession[] = [];

  async create(input: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }): Promise<TAuthSession> {
    const now = new Date();
    const session: TAuthSession = {
      id: randomUUID(),
      userId: input.userId,
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.push(session);

    return session;
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<TAuthSession | null> {
    return this.sessions.find((session) => session.refreshTokenHash === refreshTokenHash) ?? null;
  }

  async findById(id: string): Promise<TAuthSession | null> {
    return this.sessions.find((session) => session.id === id) ?? null;
  }

  async rotate(input: {
    sessionId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    lastUsedAt: Date;
  }): Promise<TAuthSession> {
    const session = this.sessions.find((entry) => entry.id === input.sessionId);

    if (!session) {
      throw new Error('Session not found.');
    }

    session.refreshTokenHash = input.refreshTokenHash;
    session.expiresAt = input.expiresAt;
    session.lastUsedAt = input.lastUsedAt;
    session.updatedAt = input.lastUsedAt;

    return session;
  }

  async revoke(sessionId: string, revokedAt: Date): Promise<void> {
    const session = this.sessions.find((entry) => entry.id === sessionId);

    if (!session) {
      return;
    }

    session.revokedAt = revokedAt;
    session.updatedAt = revokedAt;
  }
}
