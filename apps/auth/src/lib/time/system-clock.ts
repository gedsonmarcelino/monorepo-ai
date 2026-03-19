import type { IClock } from './clock.type.js';

export class SystemClock implements IClock {
  now(): Date {
    return new Date();
  }
}
