import { createHash } from 'node:crypto';

import type { PasswordHasher } from './password-hasher.js';

const digest = (value: string) => {
  return createHash('sha256').update(`phase-1:${value}`).digest('hex');
};

export class FakePasswordHasher implements PasswordHasher {
  async hash(value: string): Promise<string> {
    return `fake:${digest(value)}`;
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return hashedValue === `fake:${digest(value)}`;
  }
}

