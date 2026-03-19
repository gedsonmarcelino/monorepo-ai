import { createHash } from 'node:crypto';

import type { IPasswordHasher } from './password-hasher.type.js';

const digest = (value: string) => {
  return createHash('sha256').update(`phase-1:${value}`).digest('hex');
};

export class FakePasswordHasher implements IPasswordHasher {
  async hash(value: string): Promise<string> {
    return `fake:${digest(value)}`;
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return hashedValue === `fake:${digest(value)}`;
  }
}
