import {
  UserService,
  userService,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
  type UserStatus,
} from "./user.js";
import { UserValidator, userValidator } from "./validator.js";

export class UserManager {
  private readonly userService: UserService;
  private readonly validator: UserValidator;

  constructor(
    service: UserService = userService,
    validator: UserValidator = userValidator,
  ) {
    this.userService = service;
    this.validator = validator;
  }

  createUser(input: CreateUserInput): User {
    this.validator.assertCreate(input);
    return this.userService.create(input);
  }

  getUser(id: string): User {
    return this.userService.getRequiredById(id);
  }

  findUserByEmail(email: string): User | undefined {
    return this.userService.findByEmail(email);
  }

  listUsers(): User[] {
    return this.userService.list();
  }

  updateUser(id: string, input: UpdateUserInput): User {
    this.validator.assertUpdate(input);
    return this.userService.update(id, input);
  }

  deleteUser(id: string): boolean {
    return this.userService.delete(id);
  }

  activateUser(id: string): User {
    return this.userService.activate(id);
  }

  deactivateUser(id: string): User {
    return this.userService.deactivate(id);
  }

  suspendUser(id: string): User {
    return this.userService.suspend(id);
  }

  addRole(id: string, role: string): User {
    return this.userService.addRole(id, role);
  }

  removeRole(id: string, role: string): User {
    return this.userService.removeRole(id, role);
  }

  hasRole(id: string, role: string): boolean {
    return this.userService.hasRole(id, role);
  }

  setRoles(id: string, roles: string[]): User {
    return this.userService.setRoles(id, roles);
  }

  recordLogin(id: string): User {
    return this.userService.recordLogin(id);
  }

  count(): number {
    return this.userService.count();
  }

  countByStatus(status: UserStatus): number {
    return this.userService.countByStatus(status);
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

export const userManager = new UserManager();
