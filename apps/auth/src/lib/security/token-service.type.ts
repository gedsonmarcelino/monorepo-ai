import type { TAuthTokenPayload } from '../../contracts/auth.type.js';

export interface ITokenService {
  readonly accessTokenTtlInSeconds: number;
  createAccessToken(payload: TAuthTokenPayload): Promise<string>;
  createRefreshToken(): Promise<string>;
  readAccessToken(token: string): Promise<TAuthTokenPayload>;
}

