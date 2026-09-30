import {
  UserManager,
  UserRepository,
  UserService,
  UserValidator,
} from "./index.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
}

console.log("Running users tests...");

const service = new UserService();
const validator = new UserValidator();
const manager = new UserManager(service, validator);
const repository = new UserRepository(service);

service.clear();

const validation = validator.validateCreate({
  email: "john@example.com",
  name: "John Doe",
});

assert(validation.valid, "Valid user input passes validation");

const invalidValidation = validator.validateCreate({
  email: "invalid-email",
  name: "",
});

assert(!invalidValidation.valid, "Invalid user input fails validation");

const user = manager.createUser({
  email: "john@example.com",
  name: "John Doe",
  roles: ["user"],
  metadata: {
    department: "engineering",
  },
});

assert(!!user.id, "User ID is generated");
assert(user.email === "john@example.com", "User email is correct");
assert(user.name === "John Doe", "User name is correct");
assert(user.status === "active", "New user is active");
assert(user.roles.includes("user"), "User role is stored");

const foundById = manager.getUser(user.id);

assert(foundById.id === user.id, "User lookup by ID works");

const foundByEmail = manager.findUserByEmail("JOHN@EXAMPLE.COM");

assert(
  foundByEmail?.id === user.id,
  "User lookup by email is case insensitive",
);

assert(repository.count() === 1, "Repository count is correct");

const updated = manager.updateUser(user.id, {
  name: "John Smith",
});

assert(updated.name === "John Smith", "User can be updated");

manager.addRole(user.id, "admin");

assert(manager.hasRole(user.id, "admin"), "User role can be added");

manager.removeRole(user.id, "admin");

assert(!manager.hasRole(user.id, "admin"), "User role can be removed");

manager.setRoles(user.id, ["user", "developer"]);

assert(
  manager.hasRole(user.id, "developer"),
  "User roles can be replaced",
);

manager.suspendUser(user.id);

assert(
  manager.getUser(user.id).status === "suspended",
  "User can be suspended",
);

manager.activateUser(user.id);

assert(
  manager.getUser(user.id).status === "active",
  "User can be activated",
);

manager.deactivateUser(user.id);

assert(
  manager.getUser(user.id).status === "inactive",
  "User can be deactivated",
);

manager.activateUser(user.id);
manager.recordLogin(user.id);

const loggedInUser = manager.getUser(user.id);

assert(
  loggedInUser.lastLoginAt instanceof Date,
  "User login time can be recorded",
);

const secondUser = manager.createUser({
  email: "jane@example.com",
  name: "Jane Doe",
  status: "active",
});

assert(repository.count() === 2, "Multiple users are supported");

assert(
  manager.countByStatus("active") === 2,
  "Active user count is correct",
);

const users = manager.listUsers();

assert(users.length === 2, "User listing works");

let duplicateRejected = false;

try {
  manager.createUser({
    email: "JOHN@example.com",
    name: "Duplicate User",
  });
} catch {
  duplicateRejected = true;
}

assert(duplicateRejected, "Duplicate email is rejected");

let missingUserRejected = false;

try {
  manager.getUser("missing-user-id");
} catch {
  missingUserRejected = true;
}

assert(missingUserRejected, "Missing user is rejected");

const repositoryUser = repository.getRequiredByEmail("jane@example.com");

assert(
  repositoryUser.email === "jane@example.com",
  "Repository email lookup works",
);

const health = manager.health();

assert(health.healthy, "User service is healthy");
assert(health.userCount === 2, "Health reports correct user count");

assert(
  repository.delete(secondUser.id),
  "Repository can delete a user",
);

assert(repository.count() === 1, "User count decreases after deletion");

service.clear();

assert(manager.count() === 0, "Users can be cleared");

console.log("All users tests passed.");
