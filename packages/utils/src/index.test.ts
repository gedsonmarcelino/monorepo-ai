import { describe, expect, it } from 'vitest';

import { capitalize, formatServiceName } from './index.js';

describe('utils', () => {
  it('capitalizes string values', () => {
    expect(capitalize('worker')).toBe('Worker');
  });

  it('formats service names', () => {
    expect(formatServiceName('api')).toBe('@repo/api');
  });
});
