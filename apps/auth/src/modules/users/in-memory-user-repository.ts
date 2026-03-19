import type { IUserRepository } from './user-repository.type.js';
import type { TUser } from './user.type.js';

export class InMemoryUserRepository implements IUserRepository {
  constructor(private readonly users: TUser[]) {}

  async findByEmail(email: string): Promise<TUser | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<TUser | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}
