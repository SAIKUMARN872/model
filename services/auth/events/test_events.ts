import {
  AccountEventService,
  type AccountEventType,
} from "./index.js";

let passed = 0;

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }

  console.log(`PASS: ${message}`);
  passed++;
}

function assertThrows(
  callback: () => void,
  message: string,
): void {
  let thrown = false;

  try {
    callback();
  } catch {
    thrown = true;
  }

  assert(thrown, message);
}

const service = new AccountEventService();

service.clear();

assert(
  service.count() === 0,
  "Event service starts empty",
);

const created = service.emit({
  type: "account.created",
  accountId: "account-001",
  userId: "user-001",
  metadata: {
    source: "test",
  },
});

assert(
  created.id.length > 0,
  "Created event has an ID",
);

assert(
  created.type === "account.created",
  "Created event has correct type",
);

assert(
  created.accountId === "account-001",
  "Created event has correct account ID",
);

assert(
  created.userId === "user-001",
  "Created event has correct user ID",
);

assert(
  created.metadata.source === "test",
  "Created event preserves metadata",
);

assert(
  created.timestamp instanceof Date,
  "Created event has timestamp",
);

assert(
  service.count() === 1,
  "Event count is correct",
);

const retrieved = service.get(created.id);

assert(
  retrieved !== undefined,
  "Event can be retrieved",
);

assert(
  retrieved?.id === created.id,
  "Retrieved event has correct ID",
);

const required = service.getRequired(created.id);

assert(
  required.id === created.id,
  "Required event retrieval succeeds",
);

const updated = service.emit({
  type: "account.updated",
  accountId: "account-001",
  userId: "user-001",
  metadata: {
    field: "email",
  },
});

assert(
  updated.type === "account.updated",
  "Updated event has correct type",
);

const verified = service.emit({
  type: "account.email_verified",
  accountId: "account-001",
  userId: "user-001",
});

assert(
  verified.type === "account.email_verified",
  "Email verification event is created",
);

service.emit({
  type: "account.created",
  accountId: "account-002",
  userId: "user-002",
});

const accountEvents =
  service.getByAccountId("account-001");

assert(
  accountEvents.length === 3,
  "Account event filtering works",
);

const userEvents =
  service.getByUserId("user-001");

assert(
  userEvents.length === 3,
  "User event filtering works",
);

const createdEvents =
  service.getByType("account.created");

assert(
  createdEvents.length === 2,
  "Event type filtering works",
);

assert(
  service.countByType("account.created") === 2,
  "Event type count is correct",
);

assert(
  service.countByType("account.updated") === 1,
  "Updated event count is correct",
);

const latest = service.latest();

assert(
  latest?.accountId === "account-002",
  "Latest event is returned",
);

const copied = service.get(created.id);

assert(
  copied !== undefined,
  "Event copy is returned",
);

if (copied) {
  copied.metadata.changed = true;
}

const original = service.get(created.id);

assert(
  original?.metadata.changed !== true,
  "Event metadata is protected from mutation",
);

const health = service.health();

assert(
  health.healthy === true,
  "Event service health is healthy",
);

assert(
  health.totalEvents === 4,
  "Health reports correct event count",
);

assert(
  health.supportedEventTypes === 10,
  "Health reports supported event types",
);

const allTypes: AccountEventType[] = [
  "account.created",
  "account.updated",
  "account.activated",
  "account.deactivated",
  "account.locked",
  "account.suspended",
  "account.email_verified",
  "account.phone_verified",
  "account.activity_recorded",
  "account.deleted",
];

assert(
  allTypes.length === 10,
  "All account event types are defined",
);

assertThrows(
  () =>
    service.emit({
      type: "account.created",
      accountId: "",
      userId: "user-001",
    }),
  "Empty account ID is rejected",
);

assertThrows(
  () =>
    service.emit({
      type: "account.created",
      accountId: "account-001",
      userId: "",
    }),
  "Empty user ID is rejected",
);

assertThrows(
  () => service.getRequired("missing-event"),
  "Missing event throws an error",
);

const fromDate = new Date(Date.now() - 60_000);
const toDate = new Date(Date.now() + 60_000);

const dateFiltered = service.list({
  from: fromDate,
  to: toDate,
});

assert(
  dateFiltered.length === 4,
  "Date filtering works",
);

service.clear();

assert(
  service.count() === 0,
  "Clear removes all events",
);

assert(
  service.latest() === undefined,
  "Latest event is undefined after clear",
);

console.log(`\nAll events tests passed: ${passed}`);
