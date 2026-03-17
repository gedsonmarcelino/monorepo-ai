import type { Clock } from './clock.js';

export class FixedClock implements Clock {
  constructor(private current: Date) {}

  now(): Date {
    return new Date(this.current);
  }

  set(date: Date) {
    this.current = new Date(date);
  }
}

