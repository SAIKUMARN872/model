
import test from "node:test";
import assert from "node:assert/strict";

import { AccountService } from "./index.js";

test("AccountService: creates an account", async () => {
  const service = new AccountService();

  const result = await service.create({
    userId: "user-001",
    name: "Prasanth",
  });

  assert.equal(result.success, true);
  assert.ok(result.data?.id);
  assert.equal(result.data?.userId, "user-001");
});

test("AccountService: retrieves an account", async () => {
  const service = new AccountService();

  const created = await service.create({
    userId: "user-002",
    name: "Prasanth",
  });

  assert.ok(created.data);

  const result = await service.getById(created.data.id);

  assert.equal(result.success, true);
  assert.equal(result.data?.name, "Prasanth");
});

test("AccountService: prevents duplicate accounts", async () => {
  const service = new AccountService();

  await service.create({ userId: "user-003" });

  const duplicate = await service.create({
    userId: "user-003",
  });

  assert.equal(duplicate.success, false);
  assert.equal(
    duplicate.error?.code,
    "ACCOUNT_ALREADY_EXISTS",
  );
});

test("AccountService: updates an account", async () => {
  const service = new AccountService();

  const created = await service.create({
    userId: "user-004",
    name: "Old Name",
  });

  assert.ok(created.data);

  const updated = await service.update(created.data.id, {
    name: "New Name",
  });

  assert.equal(updated.success, true);
  assert.equal(updated.data?.name, "New Name");
});

test("AccountService: deletes an account", async () => {
  const service = new AccountService();

  const created = await service.create({
    userId: "user-005",
  });

  assert.ok(created.data);

  const deleted = await service.delete(created.data.id);

  assert.equal(deleted.success, true);
  assert.equal(await service.exists(created.data.id), false);
});

