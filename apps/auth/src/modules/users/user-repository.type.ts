import type { TUser } from './user.type.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<TUser | null>;
  findById(id: string): Promise<TUser | null>;
}

