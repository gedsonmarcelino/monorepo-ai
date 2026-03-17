import type { AuthTokenPayload } from '../../contracts/auth.js';

export interface TokenService {
  readonly accessTokenTtlInSeconds: number;
  createAccessToken(payload: AuthTokenPayload): Promise<string>;
  createRefreshToken(): Promise<string>;
  readAccessToken(token: string): Promise<AuthTokenPayload>;
}

