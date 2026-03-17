import { describe, expect, it } from 'vitest';

import { FakePasswordHasher } from './fake-password-hasher.js';

describe('FakePasswordHasher', () => {
  it('hashes a password', async () => {
    const hasher = new FakePasswordHasher();

    await expect(hasher.hash('secret-123')).resolves.toMatch(/^fake:/);
  });

  it('matches the correct password', async () => {
    const hasher = new FakePasswordHasher();
    const hash = await hasher.hash('secret-123');

    await expect(hasher.compare('secret-123', hash)).resolves.toBe(true);
    await expect(hasher.compare('wrong-password', hash)).resolves.toBe(false);
  });
});

