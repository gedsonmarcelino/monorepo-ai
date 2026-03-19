import type { IClock } from './clock.type.js';

export class FixedClock implements IClock {
  constructor(private current: Date) {}

  now(): Date {
    return new Date(this.current);
  }

  set(date: Date) {
    this.current = new Date(date);
  }
}
