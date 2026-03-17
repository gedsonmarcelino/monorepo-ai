import { createHash, randomUUID } from 'node:crypto';

import type { AuthTokenPayload } from '../../contracts/auth.js';
import type { TokenService } from './token-service.js';

const encodePayload = (payload: AuthTokenPayload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
};

const decodePayload = (token: string): AuthTokenPayload => {
  return JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as AuthTokenPayload;
};

export class FakeTokenService implements TokenService {
  readonly accessTokenTtlInSeconds = 60 * 15;

  async createAccessToken(payload: AuthTokenPayload): Promise<string> {
    return encodePayload(payload);
  }

  async createRefreshToken(): Promise<string> {
    return createHash('sha256').update(randomUUID()).digest('hex');
  }

  async readAccessToken(token: string): Promise<AuthTokenPayload> {
    return decodePayload(token);
  }
}

