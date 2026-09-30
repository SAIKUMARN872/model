import {
  UserService,
  userService,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
} from "./user.js";

export class UserRepository {
  private readonly userService: UserService;

  constructor(service: UserService = userService) {
    this.userService = service;
  }

  create(input: CreateUserInput): User {
    return this.userService.create(input);
  }

  getById(id: string): User | undefined {
    return this.userService.getById(id);
  }

  getRequiredById(id: string): User {
    return this.userService.getRequiredById(id);
  }

  findByEmail(email: string): User | undefined {
    return this.userService.findByEmail(email);
  }

  getRequiredByEmail(email: string): User {
    return this.userService.getRequiredByEmail(email);
  }

  list(): User[] {
    return this.userService.list();
  }

  update(id: string, input: UpdateUserInput): User {
    return this.userService.update(id, input);
  }

  delete(id: string): boolean {
    return this.userService.delete(id);
  }

  count(): number {
    return this.userService.count();
  }

  clear(): void {
    this.userService.clear();
  }

  health(): {
    healthy: boolean;
    userCount: number;
  } {
    return this.userService.health();
  }
}

export const userRepository = new UserRepository();
