import type { AuthenticatedUser } from '../../contracts/auth.js';

export type User = AuthenticatedUser & {
  passwordHash: string;
};

