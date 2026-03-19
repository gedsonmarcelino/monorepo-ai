import type { TAuthenticatedUser } from '../../contracts/auth.type.js';

export type TUser = TAuthenticatedUser & {
  passwordHash: string;
};

