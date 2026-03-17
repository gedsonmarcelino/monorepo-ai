import { describe, expect, it } from 'vitest';

import { createMessage } from './index.js';

describe('createMessage', () => {
  it('formats the service name', () => {
    expect(createMessage('api')).toBe('Hello from Api');
  });
});

