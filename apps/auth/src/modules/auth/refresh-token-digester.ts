import { createHash } from 'node:crypto';

export const hashRefreshToken = (value: string) => {
  return createHash('sha256').update(value).digest('hex');
};

