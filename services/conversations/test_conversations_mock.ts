import test from "node:test";
import assert from "node:assert/strict";

import {
  createConversation,
  createMessage,
  createShare,
  createArchiveRecord,
  createDeleteRecord,
  validateCreateConversation,
  validateConversation,
  validateCreateMessage,
  validateCreateShare,
  cloneRecord,
  isExpired,
  loadConversationConfig,
  conversationSettings,
  ConversationEventEmitter,
  conversationEvents,
  archiveEvents,
  deleteEvents,
  shareEvents,
  ConversationRepository,
  MessageRepository,
  ArchiveRepository,
  ShareRepository,
  ConversationService,
  MessageService,
  ArchiveService,
  DeleteService,
  ShareService,
  ArchiveController,
  DeleteController,
  ShareController,
  ValidationError,
  NotFoundError,
  InvalidStateError,
  PermissionError,
  AlreadyExistsError
} from "./index.js";

import type {
  Conversation,
  CreateConversationInput,
  CreateMessageInput
} from "./interfaces.js";

function makeConversationInput(
  overrides: Partial<CreateConversationInput> = {}
): CreateConversationInput {
  return { ownerId: "owner-1", title: "Test conversation", ...overrides };
}

function makeMessageInput(
  conversationId: string,
  overrides: Partial<CreateMessageInput> = {}
): CreateMessageInput {
  return {
    conversationId,
    role: "user",
    content: "Hello, world!",
    ...overrides
  };
}

function setup() {
  const conversations = new ConversationService(new ConversationRepository());
  const messages = new MessageService(conversations, new MessageRepository(), 10);
  const archives = new ArchiveService(conversations, new ArchiveRepository());
  const deletes = new DeleteService(conversations, messages);
  const shares = new ShareService(
    conversations,
    new ShareRepository(),
    true,
    10
  );

  return { conversations, messages, archives, deletes, shares };
}

test("models create conversation, message, share, archive and delete records", () => {
  const conversation = createConversation(makeConversationInput());
  assert.ok(conversation.id.startsWith("conv_"));
  assert.equal(conversation.title, "Test conversation");
  assert.equal(conversation.ownerId, "owner-1");
  assert.equal(conversation.status, "active");
  assert.equal(conversation.messageCount, 0);
  assert.ok(conversation.createdAt instanceof Date);

  const message = createMessage(makeMessageInput(conversation.id));
  assert.ok(message.id.startsWith("msg_"));
  assert.equal(message.conversationId, conversation.id);
  assert.equal(message.role, "user");

  const share = createShare({
    conversationId: conversation.id,
    ownerId: "owner-1"
  });
  assert.ok(share.id.startsWith("share_"));
  assert.ok(share.token);
  assert.equal(share.isPublic, false);

  const archive = createArchiveRecord(conversation.id, "owner-1");
  assert.equal(archive.conversationId, conversation.id);

  const deletion = createDeleteRecord(conversation.id, "owner-1", true);
  assert.equal(deletion.permanent, true);
});

test("conversation model defaults an empty title", () => {
  const conversation = createConversation({ ownerId: "owner-1", title: " " });
  assert.equal(conversation.title, "Untitled conversation");
});

test("validators accept valid conversation, message and share inputs", () => {
  const conversation = createConversation(makeConversationInput());
  assert.doesNotThrow(() => validateCreateConversation(makeConversationInput()));
  assert.doesNotThrow(() => validateConversation(conversation));
  assert.doesNotThrow(() => validateCreateMessage(makeMessageInput(conversation.id)));
  assert.doesNotThrow(() =>
    validateCreateShare({
      conversationId: conversation.id,
      ownerId: "owner-1",
      expiresAt: new Date(Date.now() + 60_000)
    })
  );
});

test("conversation validator rejects missing owner", () => {
  assert.throws(
    () => validateCreateConversation({ ownerId: " " }),
    ValidationError
  );
});

test("conversation validator rejects invalid message counts", () => {
  const conversation = createConversation(makeConversationInput());
  conversation.messageCount = -1;
  assert.throws(() => validateConversation(conversation), ValidationError);
});

test("message validator rejects missing conversation ID and empty content", () => {
  assert.throws(
    () => validateCreateMessage(makeMessageInput("")),
    ValidationError
  );
  assert.throws(
    () => validateCreateMessage(makeMessageInput("conv-1", { content: " " })),
    ValidationError
  );
});

test("share validator rejects missing owner and invalid expiration", () => {
  assert.throws(
    () => validateCreateShare({ conversationId: "conv-1", ownerId: " " }),
    ValidationError
  );
  assert.throws(
    () =>
      validateCreateShare({
        conversationId: "conv-1",
        ownerId: "owner-1",
        expiresAt: new Date(Number.NaN)
      }),
    ValidationError
  );
});

test("configuration loads defaults and supports overrides", () => {
  assert.deepEqual(loadConversationConfig(), {
    maxMessages: 1000,
    maxShares: 100,
    allowPublicShares: true
  });

  assert.deepEqual(
    loadConversationConfig({
      maxMessages: 25,
      maxShares: 5,
      allowPublicShares: false
    }),
    {
      maxMessages: 25,
      maxShares: 5,
      allowPublicShares: false
    }
  );

  assert.equal(conversationSettings.allowArchive, true);
  assert.equal(conversationSettings.allowDelete, true);
  assert.equal(conversationSettings.allowShare, true);
});

test("cloneRecord returns independent nested records and dates", () => {
  const original = {
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    nested: { values: [1, 2] }
  };
  const copy = cloneRecord(original);
  copy.nested.values.push(3);
  copy.createdAt.setFullYear(2030);

  assert.deepEqual(original.nested.values, [1, 2]);
  assert.equal(original.createdAt.getFullYear(), 2025);
});

test("isExpired handles missing, future and past expiration dates", () => {
  const now = new Date("2025-01-01T00:00:00.000Z");
  assert.equal(isExpired(undefined, now), false);
  assert.equal(isExpired(new Date("2025-01-02T00:00:00.000Z"), now), false);
  assert.equal(isExpired(new Date("2024-12-31T00:00:00.000Z"), now), true);
  assert.equal(isExpired(now, now), true);
});

test("conversation repository saves, retrieves, lists and deletes", () => {
  const repository = new ConversationRepository();
  const conversation = createConversation(makeConversationInput());

  repository.save(conversation);
  assert.equal(repository.get(conversation.id)?.id, conversation.id);
  assert.equal(repository.listByOwner("owner-1").length, 1);
  assert.equal(repository.listByOwner("other-owner").length, 0);
  assert.equal(repository.delete(conversation.id), true);
  assert.equal(repository.get(conversation.id), undefined);
  assert.equal(repository.delete("missing"), false);
});

test("conversation repository returns copies rather than mutable stored records", () => {
  const repository = new ConversationRepository();
  const conversation = createConversation(makeConversationInput());
  repository.save(conversation);

  const retrieved = repository.get(conversation.id)!;
  retrieved.title = "Mutated";
  assert.equal(repository.get(conversation.id)?.title, "Test conversation");
});

test("conversation repository can include deleted conversations", () => {
  const repository = new ConversationRepository();
  const conversation = createConversation(makeConversationInput());
  conversation.status = "deleted";
  repository.save(conversation);

  assert.equal(repository.listByOwner("owner-1").length, 0);
  assert.equal(repository.listByOwner("owner-1", true).length, 1);
});

test("message repository stores and orders messages", () => {
  const repository = new MessageRepository();
  const first = createMessage(makeMessageInput("conv-1", { content: "First" }));
  const second = createMessage(makeMessageInput("conv-1", { content: "Second" }));

  first.createdAt = new Date("2025-01-01T00:00:00.000Z");
  second.createdAt = new Date("2025-01-02T00:00:00.000Z");
  repository.save(second);
  repository.save(first);

  assert.equal(repository.get(first.id)?.content, "First");
  assert.deepEqual(
    repository.listByConversation("conv-1").map(message => message.content),
    ["First", "Second"]
  );
});

test("message repository deletes all messages for a conversation", () => {
  const repository = new MessageRepository();
  repository.save(createMessage(makeMessageInput("conv-1")));
  repository.save(createMessage(makeMessageInput("conv-1")));
  repository.save(createMessage(makeMessageInput("conv-2")));

  assert.equal(repository.deleteByConversation("conv-1"), 2);
  assert.equal(repository.listByConversation("conv-1").length, 0);
  assert.equal(repository.listByConversation("conv-2").length, 1);
});

test("archive repository saves and filters archive records", () => {
  const repository = new ArchiveRepository();
  repository.save(createArchiveRecord("conv-1", "owner-1"));
  repository.save(createArchiveRecord("conv-2", "owner-1"));
  repository.save(createArchiveRecord("conv-3", "owner-2"));

  assert.equal(repository.listByOwner("owner-1").length, 2);
  assert.equal(repository.listByConversation("conv-1").length, 1);
});

test("share repository finds shares by ID and token", () => {
  const repository = new ShareRepository();
  const share = createShare({ conversationId: "conv-1", ownerId: "owner-1" });
  repository.save(share);

  assert.equal(repository.get(share.id)?.id, share.id);
  assert.equal(repository.getByToken(share.token)?.id, share.id);
  assert.equal(repository.listByOwner("owner-1").length, 1);
  assert.equal(repository.listByConversation("conv-1").length, 1);
  assert.equal(repository.getByToken("missing"), undefined);
  assert.equal(repository.delete(share.id), true);
});

test("conversation service creates, gets, lists and renames conversations", () => {
  const { conversations } = setup();
  const created = conversations.create(makeConversationInput());

  assert.equal(conversations.get(created.id, "owner-1").id, created.id);
  assert.equal(conversations.list("owner-1").length, 1);

  const renamed = conversations.rename(created.id, "owner-1", "Renamed");
  assert.equal(renamed.title, "Renamed");
  assert.equal(conversations.get(created.id)?.title, "Renamed");
});

test("conversation service rejects access by another owner", () => {
  const { conversations } = setup();
  const conversation = conversations.create(makeConversationInput());

  assert.throws(
    () => conversations.get(conversation.id, "another-owner"),
    PermissionError
  );
});

test("conversation service rejects missing conversations", () => {
  const { conversations } = setup();
  assert.throws(() => conversations.get("missing"), NotFoundError);
});

test("conversation service rejects blank titles and renaming archived conversations", () => {
  const { conversations, archives } = setup();
  const conversation = conversations.create(makeConversationInput());

  assert.throws(
    () => conversations.rename(conversation.id, "owner-1", " "),
    ValidationError
  );

  archives.archive(conversation.id, "owner-1");
  assert.throws(
    () => conversations.rename(conversation.id, "owner-1", "New title"),
    InvalidStateError
  );
});

test("conversation service checks IDs for duplicates", () => {
  const { conversations } = setup();
  const conversation = conversations.create(makeConversationInput());

  assert.throws(() => conversations.ensureUniqueId(conversation.id), AlreadyExistsError);
  assert.doesNotThrow(() => conversations.ensureUniqueId("unused-id"));
});

test("message service adds and retrieves messages while updating counts", () => {
  const { conversations, messages } = setup();
  const conversation = conversations.create(makeConversationInput());

  const message = messages.add(makeMessageInput(conversation.id), "owner-1");
  assert.equal(messages.get(message.id).content, "Hello, world!");
  assert.equal(messages.list(conversation.id, "owner-1").length, 1);
  assert.equal(conversations.get(conversation.id)?.messageCount, 1);
});

test("message service rejects messages for non-active conversations", () => {
  const { conversations, messages, archives } = setup();
  const conversation = conversations.create(makeConversationInput());
  archives.archive(conversation.id, "owner-1");

  assert.throws(
    () => messages.add(makeMessageInput(conversation.id), "owner-1"),
    InvalidStateError
  );
});

test("message service enforces the configured message limit", () => {
  const conversations = new ConversationService();
  const messages = new MessageService(conversations, new MessageRepository(), 1);
  const conversation = conversations.create(makeConversationInput());

  messages.add(makeMessageInput(conversation.id), "owner-1");
  assert.throws(
    () => messages.add(makeMessageInput(conversation.id), "owner-1"),
    InvalidStateError
  );
});

test("message service rejects unknown messages and unauthorized conversation access", () => {
  const { conversations, messages } = setup();
  const conversation = conversations.create(makeConversationInput());

  assert.throws(() => messages.get("missing"), NotFoundError);
  assert.throws(() => messages.list(conversation.id, "wrong-owner"), PermissionError);
});

test("archive service archives and restores conversations", () => {
  const { conversations, archives } = setup();
  const conversation = conversations.create(makeConversationInput());

  const record = archives.archive(conversation.id, "owner-1");
  assert.equal(record.conversationId, conversation.id);
  assert.equal(conversations.get(conversation.id)?.status, "archived");
  assert.equal(archives.list("owner-1").length, 1);
  assert.equal(archives.get(conversation.id).id, record.id);

  archives.restore(conversation.id, "owner-1");
  assert.equal(conversations.get(conversation.id)?.status, "active");
});

test("archive service rejects duplicate archive and invalid restore operations", () => {
  const { conversations, archives } = setup();
  const conversation = conversations.create(makeConversationInput());

  assert.throws(
    () => archives.restore(conversation.id, "owner-1"),
    InvalidStateError
  );

  archives.archive(conversation.id, "owner-1");
  assert.throws(
    () => archives.archive(conversation.id, "owner-1"),
    InvalidStateError
  );
});

test("delete service soft-deletes a conversation", () => {
  const { conversations, deletes } = setup();
  const conversation = conversations.create(makeConversationInput());

  const record = deletes.delete(conversation.id, "owner-1");
  assert.equal(record.permanent, false);
  assert.throws(() => conversations.get(conversation.id), NotFoundError);
});

test("delete service permanently deletes a conversation's messages", () => {
  const { conversations, messages, deletes } = setup();
  const conversation = conversations.create(makeConversationInput());
  messages.add(makeMessageInput(conversation.id), "owner-1");
  assert.equal(messages.getRepository().listByConversation(conversation.id).length, 1);

  const record = deletes.delete(conversation.id, "owner-1", true);
  assert.equal(record.permanent, true);
  assert.equal(messages.getRepository().listByConversation(conversation.id).length, 0);
});

test("delete service rejects deleting an already deleted conversation", () => {
  const { conversations, deletes } = setup();
  const conversation = conversations.create(makeConversationInput());
  deletes.delete(conversation.id, "owner-1");

  assert.throws(
    () => deletes.delete(conversation.id, "owner-1"),
    NotFoundError
  );
});

test("share service creates, resolves, lists and revokes shares", () => {
  const { conversations, shares } = setup();
  const conversation = conversations.create(makeConversationInput());

  const share = shares.create({
    conversationId: conversation.id,
    ownerId: "owner-1",
    isPublic: true
  });

  assert.equal(shares.get(share.id, "owner-1").id, share.id);
  assert.equal(shares.resolve(share.token).id, share.id);
  assert.equal(shares.list(conversation.id, "owner-1").length, 1);

  shares.revoke(share.id, "owner-1");
  assert.equal(shares.list(conversation.id, "owner-1").length, 0);
  assert.throws(() => shares.resolve(share.token), NotFoundError);
});

test("share service rejects unauthorized access and unknown shares", () => {
  const { conversations, shares } = setup();
  const conversation = conversations.create(makeConversationInput());
  const share = shares.create({
    conversationId: conversation.id,
    ownerId: "owner-1"
  });

  assert.throws(() => shares.get(share.id, "another-owner"), PermissionError);
  assert.throws(() => shares.get("missing", "owner-1"), NotFoundError);
  assert.throws(() => shares.resolve("unknown-token"), NotFoundError);
});

test("share service rejects public shares when disabled", () => {
  const conversations = new ConversationService();
  const conversation = conversations.create(makeConversationInput());
  const shares = new ShareService(conversations, new ShareRepository(), false, 10);

  assert.throws(
    () => shares.create({
      conversationId: conversation.id,
      ownerId: "owner-1",
      isPublic: true
    }),
    PermissionError
  );
});

test("share service rejects expired-at-creation shares and enforces limits", () => {
  const conversations = new ConversationService();
  const conversation = conversations.create(makeConversationInput());
  const shares = new ShareService(conversations, new ShareRepository(), true, 1);

  assert.throws(
    () => shares.create({
      conversationId: conversation.id,
      ownerId: "owner-1",
      expiresAt: new Date(Date.now() - 1000)
    }),
    ValidationError
  );

  shares.create({ conversationId: conversation.id, ownerId: "owner-1" });
  assert.throws(
    () => shares.create({ conversationId: conversation.id, ownerId: "owner-1" }),
    InvalidStateError
  );
});

test("share service rejects shares for deleted conversations", () => {
  const { conversations, deletes, shares } = setup();
  const conversation = conversations.create(makeConversationInput());
  deletes.delete(conversation.id, "owner-1");

  assert.throws(
    () => shares.create({ conversationId: conversation.id, ownerId: "owner-1" }),
    NotFoundError
  );
});

test("event emitter notifies listeners and supports unsubscribe", () => {
  const emitter = new ConversationEventEmitter();
  const received: string[] = [];
  const unsubscribe = emitter.subscribe(event => received.push(event.type));

  emitter.emit({
    type: "test.event",
    conversationId: "conv-1",
    ownerId: "owner-1",
    timestamp: new Date()
  });
  unsubscribe();
  emitter.emit({
    type: "ignored.event",
    conversationId: "conv-1",
    ownerId: "owner-1",
    timestamp: new Date()
  });

  assert.deepEqual(received, ["test.event"]);
});

test("conversation event stream receives creation events", () => {
  const received: string[] = [];
  const unsubscribe = conversationEvents.subscribe(event => received.push(event.type));

  try {
    const conversations = new ConversationService();
    conversations.create(makeConversationInput());
    assert.ok(received.includes("conversation.created"));
  } finally {
    unsubscribe();
  }
});

test("archive, delete and share events are emitted", () => {
  const received: string[] = [];
  const unsubscribers = [
    archiveEvents.subscribe(event => received.push(event.type)),
    deleteEvents.subscribe(event => received.push(event.type)),
    shareEvents.subscribe(event => received.push(event.type))
  ];

  try {
    const { conversations, archives, deletes, shares } = setup();
    const first = conversations.create(makeConversationInput());
    archives.archive(first.id, "owner-1");

    const second = conversations.create(makeConversationInput());
    shares.create({ conversationId: second.id, ownerId: "owner-1" });
    deletes.delete(second.id, "owner-1");

    assert.ok(received.includes("conversation.archived"));
    assert.ok(received.includes("conversation.shared"));
    assert.ok(received.includes("conversation.deleted"));
  } finally {
    for (const unsubscribe of unsubscribers) unsubscribe();
  }
});

test("controllers delegate archive, delete and share operations", () => {
  const { conversations, archives, deletes, shares } = setup();
  const archiveController = new ArchiveController(archives);
  const deleteController = new DeleteController(deletes);
  const shareController = new ShareController(shares);

  const first = conversations.create(makeConversationInput());
  assert.equal(archiveController.archive(first.id, "owner-1").conversationId, first.id);
  archiveController.restore(first.id, "owner-1");

  const share = shareController.create({
    conversationId: first.id,
    ownerId: "owner-1"
  });
  assert.equal(shareController.get(share.id, "owner-1").id, share.id);
  assert.equal(shareController.resolve(share.token).id, share.id);
  assert.equal(shareController.list(first.id, "owner-1").length, 1);
  assert.ok(shareController.revoke(share.id, "owner-1").revokedAt);

  const second = conversations.create(makeConversationInput());
  assert.equal(deleteController.delete(second.id, "owner-1").conversationId, second.id);
});

test("all created records have unique IDs", () => {
  const first = createConversation(makeConversationInput());
  const second = createConversation(makeConversationInput());

  assert.notEqual(first.id, second.id);
});

test("archived conversations remain available to their owner but are excluded from active operations", () => {
  const { conversations, archives, messages } = setup();
  const conversation = conversations.create(makeConversationInput());
  archives.archive(conversation.id, "owner-1");

  assert.equal(conversations.get(conversation.id, "owner-1").status, "archived");
  assert.throws(
    () => messages.add(makeMessageInput(conversation.id), "owner-1"),
    InvalidStateError
  );
});

test("deleted conversations are excluded from owner listings", () => {
  const { conversations, deletes } = setup();
  const conversation = conversations.create(makeConversationInput());
  deletes.delete(conversation.id, "owner-1");

  assert.equal(conversations.list("owner-1").length, 0);
});

test("message metadata is copied when a message is created", () => {
  const metadata = { source: "mock", flags: ["one"] };
  const message = createMessage(makeMessageInput("conv-1", { metadata }));

  metadata.flags.push("two");
  assert.deepEqual(message.metadata?.flags, ["one"]);
});

test("share expiry is checked when resolving a token", () => {
  const { conversations, shares } = setup();
  const conversation = conversations.create(makeConversationInput());
  const share = shares.create({
    conversationId: conversation.id,
    ownerId: "owner-1",
    expiresAt: new Date(Date.now() + 60_000)
  });

  assert.equal(shares.resolve(share.token).id, share.id);
  const repository = shares["repository"];
  repository.save({ ...share, expiresAt: new Date(Date.now() - 1000) });

  assert.throws(() => shares.resolve(share.token), NotFoundError);
});

