import {
  SessionManager,
  SessionService,
  MemorySessionStorage,
} from "./index.js";

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
}

function assertThrows(
  action: () => unknown,
  message: string,
): void {
  try {
    action();
    throw new Error(`Expected error: ${message}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === `Expected error: ${message}`
    ) {
      throw error;
    }

    console.log(`PASS: ${message}`);
  }
}

function runTests(): void {
  console.log("Running sessions tests...");

  const service = new SessionService();

  const session = service.create({
    userId: "user-001",
    expiresInSeconds: 3600,
    metadata: {
      ip: "127.0.0.1",
      client: "web",
    },
  });

  assert(
    session.id.length > 0,
    "Session ID is generated",
  );

  assert(
    session.token.length > 0,
    "Session token is generated",
  );

  assert(
    session.status === "active",
    "New session is active",
  );

  assert(
    session.userId === "user-001",
    "Session user ID is correct",
  );

  assert(
    service.get(session.id)?.id === session.id,
    "Session lookup works",
  );

  assert(
    service.getByToken(session.token)?.id === session.id,
    "Session token lookup works",
  );

  assert(
    service.isValid(session.id),
    "Session validation works",
  );

  assert(
    service.isTokenValid(session.token),
    "Token validation works",
  );

  assert(
    service.getUserSessions("user-001").length === 1,
    "User sessions can be retrieved",
  );

  assert(
    service.getActiveUserSessions("user-001").length === 1,
    "Active user sessions can be retrieved",
  );

  assert(
    service.touch(session.id),
    "Session can be refreshed",
  );

  assert(
    service.count() === 1,
    "Session count is correct",
  );

  assert(
    service.activeCount() === 1,
    "Active session count is correct",
  );

  assertThrows(
    () =>
      service.create({
        userId: "",
      }),
    "Empty user ID is rejected",
  );

  assertThrows(
    () =>
      service.create({
        userId: "user-002",
        expiresInSeconds: 0,
      }),
    "Invalid expiration is rejected",
  );

  const secondSession = service.create({
    userId: "user-001",
    expiresInSeconds: 3600,
  });

  assert(
    service.count() === 2,
    "Multiple sessions are supported",
  );

  assert(
    service.revoke(secondSession.id),
    "Session can be revoked",
  );

  assert(
    !service.isValid(secondSession.id),
    "Revoked session is invalid",
  );

  assert(
    service.revokeUserSessions("user-001") === 1,
    "Remaining user sessions can be revoked",
  );

  assert(
    service.activeCount() === 0,
    "No active sessions remain",
  );

  assert(
    service.delete(secondSession.id),
    "Session can be deleted",
  );

  assert(
    service.count() === 1,
    "Deleted session is removed",
  );

  const managerService = new SessionService();

  const manager = new SessionManager({
    service: managerService,
  });

  const managedSession = manager.createSession({
    userId: "manager-user",
    expiresInSeconds: 3600,
  });

  assert(
    manager.getSession(managedSession.id)?.id === managedSession.id,
    "Session manager lookup works",
  );

  assert(
    manager.validateSession(managedSession.id),
    "Session manager validation works",
  );

  assert(
    manager.validateToken(managedSession.token),
    "Session manager token validation works",
  );

  assert(
    manager.refreshSession(managedSession.id),
    "Session manager refresh works",
  );

  assert(
    manager.revokeSession(managedSession.id),
    "Session manager revoke works",
  );

  const storage = new MemorySessionStorage();

  storage.save(session);

  assert(
    storage.count() === 1,
    "Session storage saves sessions",
  );

  assert(
    storage.get(session.id)?.id === session.id,
    "Session storage lookup works",
  );

  assert(
    storage.getByToken(session.token)?.id === session.id,
    "Session storage token lookup works",
  );

  assert(
    storage.delete(session.id),
    "Session storage deletion works",
  );

  assert(
    storage.count() === 0,
    "Session storage is empty after deletion",
  );

  const health = service.health();

  assert(
    health.healthy,
    "Session service is healthy",
  );

  service.clear();

  assert(
    service.count() === 0,
    "Sessions can be cleared",
  );

  manager.clear();

  assert(
    manager.count() === 0,
    "Session manager can be cleared",
  );

  storage.clear();

  assert(
    storage.count() === 0,
    "Session storage can be cleared",
  );

  console.log("All sessions tests passed.");
}

runTests();
