import { createHash, randomUUID } from 'node:crypto';

import type { TAuthTokenPayload } from '../../contracts/auth.type.js';
import type { ITokenService } from './token-service.type.js';

const encodePayload = (payload: TAuthTokenPayload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
};

const decodePayload = (token: string): TAuthTokenPayload => {
  return JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as TAuthTokenPayload;
};

export class FakeTokenService implements ITokenService {
  readonly accessTokenTtlInSeconds = 60 * 15;

  async createAccessToken(payload: TAuthTokenPayload): Promise<string> {
    return encodePayload(payload);
  }

  async createRefreshToken(): Promise<string> {
    return createHash('sha256').update(randomUUID()).digest('hex');
  }

  async readAccessToken(token: string): Promise<TAuthTokenPayload> {
    return decodePayload(token);
  }
}
