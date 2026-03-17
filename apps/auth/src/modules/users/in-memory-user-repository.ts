import type { UserRepository } from './user-repository.js';
import type { User } from './user.js';

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

