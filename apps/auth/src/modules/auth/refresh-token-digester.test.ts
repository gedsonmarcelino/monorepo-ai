import { describe, expect, it } from 'vitest';

import { hashRefreshToken } from './refresh-token-digester.js';

describe('hashRefreshToken', () => {
  it('returns a deterministic hash', () => {
    expect(hashRefreshToken('refresh-token')).toBe(hashRefreshToken('refresh-token'));
  });

  it('changes the hash when the token changes', () => {
    expect(hashRefreshToken('token-a')).not.toBe(hashRefreshToken('token-b'));
  });
});

