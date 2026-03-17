import { describe, expect, it } from 'vitest';

import { FakeTokenService } from './fake-token-service.js';

describe('FakeTokenService', () => {
  it('creates an access token with the expected payload', async () => {
    const service = new FakeTokenService();

    const token = await service.createAccessToken({
      email: 'active@example.com',
      sessionId: 'session-1',
      sub: 'user-1',
    });

    await expect(service.readAccessToken(token)).resolves.toEqual({
      email: 'active@example.com',
      sessionId: 'session-1',
      sub: 'user-1',
    });
  });

  it('creates distinct refresh tokens', async () => {
    const service = new FakeTokenService();

    const first = await service.createRefreshToken();
    const second = await service.createRefreshToken();

    expect(first).not.toBe(second);
  });
});

