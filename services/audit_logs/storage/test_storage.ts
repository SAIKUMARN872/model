import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  StorageArchive,
  StorageRepository,
} from "./index.js";

test("repository creates a record", () => {
  const repository =
    new StorageRepository();

  const record =
    repository.create({
      id: "record-1",
      data: {
        name: "Prasanth",
        role: "AI Engineer",
      },
    });

  assert.equal(
    record.id,
    "record-1",
  );

  assert.equal(
    record.data.name,
    "Prasanth",
  );

  assert.equal(
    record.data.role,
    "AI Engineer",
  );

  assert.ok(record.createdAt);
  assert.ok(record.updatedAt);
});

test("repository gets a record by id", () => {
  const repository =
    new StorageRepository();

  repository.create({
    id: "record-1",
    data: {
      value: 100,
    },
  });

  const record =
    repository.getById(
      "record-1",
    );

  assert.ok(record);

  assert.equal(
    record.id,
    "record-1",
  );

  assert.equal(
    record.data.value,
    100,
  );
});

test("repository updates a record", () => {
  const repository =
    new StorageRepository();

  repository.create({
    id: "record-1",
    data: {
      status: "pending",
    },
  });

  const updated =
    repository.update(
      "record-1",
      {
        data: {
          status: "completed",
        },
      },
    );

  assert.equal(
    updated.data.status,
    "completed",
  );

  assert.notEqual(
    updated.updatedAt,
    "",
  );
});

test("repository upserts a record", () => {
  const repository =
    new StorageRepository();

  const created =
    repository.upsert({
      id: "record-1",
      data: {
        version: 1,
      },
    });

  assert.equal(
    created.data.version,
    1,
  );

  const updated =
    repository.upsert({
      id: "record-1",
      data: {
        version: 2,
      },
    });

  assert.equal(
    updated.data.version,
    2,
  );

  assert.equal(
    repository.count(),
    1,
  );
});

test("repository checks existence", () => {
  const repository =
    new StorageRepository();

  assert.equal(
    repository.exists("record-1"),
    false,
  );

  repository.create({
    id: "record-1",
    data: {},
  });

  assert.equal(
    repository.exists("record-1"),
    true,
  );
});

test("repository finds records", () => {
  const repository =
    new StorageRepository();

  repository.create({
    id: "record-1",
    data: {
      type: "user",
    },
  });

  repository.create({
    id: "record-2",
    data: {
      type: "project",
    },
  });

  const results =
    repository.find(
      (record) =>
        record.data.type ===
        "user",
    );

  assert.equal(
    results.length,
    1,
  );

  assert.equal(
    results[0]?.id,
    "record-1",
  );
});

test("repository deletes records", () => {
  const repository =
    new StorageRepository();

  repository.create({
    id: "record-1",
    data: {},
  });

  assert.equal(
    repository.delete("record-1"),
    true,
  );

  assert.equal(
    repository.exists("record-1"),
    false,
  );

  assert.equal(
    repository.delete("record-1"),
    false,
  );
});

test("repository clear works", () => {
  const repository =
    new StorageRepository();

  repository.create({
    id: "record-1",
    data: {},
  });

  repository.create({
    id: "record-2",
    data: {},
  });

  assert.equal(
    repository.count(),
    2,
  );

  repository.clear();

  assert.equal(
    repository.count(),
    0,
  );
});

test("repository health works", () => {
  const repository =
    new StorageRepository();

  const health =
    repository.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.recordCount,
    0,
  );

  assert.ok(
    health.timestamp,
  );
});

test("archive stores a record", () => {
  const archive =
    new StorageArchive();

  const archived =
    archive.archive(
      {
        id: "record-1",
        data: {
          name: "test",
        },
        createdAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
      },
      {
        reason:
          "Retention policy",
      },
    );

  assert.ok(archived.id);

  assert.equal(
    archived.originalId,
    "record-1",
  );

  assert.equal(
    archived.data.name,
    "test",
  );

  assert.equal(
    archived.reason,
    "Retention policy",
  );

  assert.ok(
    archived.archivedAt,
  );
});

test("archive finds records by original id", () => {
  const archive =
    new StorageArchive();

  const record = {
    id: "record-1",
    data: {
      value: 100,
    },
    createdAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  };

  archive.archive(record);
  archive.archive(record);

  const results =
    archive.findByOriginalId(
      "record-1",
    );

  assert.equal(
    results.length,
    2,
  );
});

test("archive supports multiple records", () => {
  const archive =
    new StorageArchive();

  const records = [
    {
      id: "record-1",
      data: {
        value: 1,
      },
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
    },
    {
      id: "record-2",
      data: {
        value: 2,
      },
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
    },
  ];

  const result =
    archive.archiveMany(
      records,
      {
        reason: "Bulk archive",
      },
    );

  assert.equal(
    result.length,
    2,
  );

  assert.equal(
    archive.count(),
    2,
  );
});

test("archive gets record by id", () => {
  const archive =
    new StorageArchive();

  const archived =
    archive.archive({
      id: "record-1",
      data: {
        value: 100,
      },
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
    });

  const result =
    archive.getById(
      archived.id,
    );

  assert.ok(result);

  assert.equal(
    result.originalId,
    "record-1",
  );
});

test("archive deletes records", () => {
  const archive =
    new StorageArchive();

  const archived =
    archive.archive({
      id: "record-1",
      data: {},
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
    });

  assert.equal(
    archive.delete(
      archived.id,
    ),
    true,
  );

  assert.equal(
    archive.count(),
    0,
  );
});

test("archive health works", () => {
  const archive =
    new StorageArchive();

  const health =
    archive.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.archivedCount,
    0,
  );

  assert.ok(
    health.timestamp,
  );
});