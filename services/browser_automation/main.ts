import { randomUUID } from "node:crypto";

export type BrowserSessionStatus =
  | "created"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "closed";

export type BrowserTaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type BrowserEventType =
  | "session.created"
  | "session.started"
  | "session.completed"
  | "session.failed"
  | "task.created"
  | "task.started"
  | "task.completed"
  | "task.failed"
  | "download.created"
  | "custom";

export interface BrowserConfig {
  baseUrl?: string;
  timeoutMs: number;
  maxRetries: number;
  maxConcurrentTasks: number;
  headless: boolean;
}

export interface BrowserSessionInput {
  userId: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface BrowserSession {
  id: string;
  userId: string;
  url: string;
  status: BrowserSessionStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface BrowserTaskInput {
  sessionId: string;
  url: string;
  type?: string;
  action?: string;
  name?: string;
  input?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  userId?: string;
}

export interface BrowserTask {
  id: string;
  sessionId: string;
  userId?: string;
  url: string;
  type: string;
  action: string;
  name: string;
  input: Record<string, unknown>;
  payload: Record<string, unknown>;
  status: BrowserTaskStatus;
  attempts: number;
  output?: unknown;
  result?: unknown;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrowserEvent {
  id: string;
  type: BrowserEventType | string;
  timestamp: Date;
  sessionId?: string;
  taskId?: string;
  userId?: string;
  data?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}

export interface BrowserResult<T> {
  ok: boolean;
  success?: boolean;
  data?: T;
  error?: string;
  taskId?: string;
  sessionId?: string;
  state?: Record<string, unknown>;
}

export interface BrowserCredentialInput {
  name?: string;
  key?: string;
  username?: string;
  password?: string;
  secret?: string;
  value?: string;
  metadata?: Record<string, unknown>;
}

export interface BrowserCredential {
  id: string;
  name: string;
  key: string;
  username?: string;
  password?: string;
  secret?: string;
  value?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface Download {
  id: string;
  sessionId?: string;
  taskId?: string;
  url?: string;
  filename: string;
  content?: string;
  createdAt: Date;
}

export interface BrowserJob {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: Date;
}

export interface BrowserCheckpoint {
  id: string;
  sessionId?: string;
  taskId?: string;
  state: Record<string, unknown>;
  createdAt: Date;
}

export interface RetryPolicyConfig {
  maxAttempts?: number;
  maxRetries?: number;
  delayMs?: number;
}

export interface BrowserMetric {
  name: string;
  value: number;
  timestamp: Date;
}

export interface BrowserPermission {
  userId: string;
  permission: string;
}

export class BrowserAutomationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrowserAutomationError";
  }
}

export class ValidationError extends BrowserAutomationError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends BrowserAutomationError {
  code = "NOT_FOUND";

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class AuthenticationError extends BrowserAutomationError {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class PermissionError extends BrowserAutomationError {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

export class BrowserTimeoutError extends BrowserAutomationError {
  constructor(message: string) {
    super(message);
    this.name = "BrowserTimeoutError";
  }
}

export class BrowserConfigError extends BrowserAutomationError {
  constructor(message: string) {
    super(message);
    this.name = "BrowserConfigError";
  }
}

const clone = <T>(value: T): T =>
  value === undefined
    ? value
    : JSON.parse(JSON.stringify(value));

const now = (): Date => new Date();

export function createBrowserConfig(
  input: Partial<BrowserConfig> = {}
): BrowserConfig {
  return {
    baseUrl: input.baseUrl,
    timeoutMs: input.timeoutMs ?? 30000,
    maxRetries: input.maxRetries ?? 3,
    maxConcurrentTasks: input.maxConcurrentTasks ?? 5,
    headless: input.headless ?? true
  };
}

export function validateBrowserConfig(config: BrowserConfig): true {
  if (!config || typeof config !== "object") {
    throw new BrowserConfigError("config is required");
  }

  if (typeof config.timeoutMs !== "number" || config.timeoutMs <= 0) {
    throw new BrowserConfigError("timeoutMs must be greater than zero");
  }

  if (typeof config.maxRetries !== "number" || config.maxRetries < 0) {
    throw new BrowserConfigError("maxRetries cannot be negative");
  }

  if (
    config.maxConcurrentTasks !== undefined &&
    (typeof config.maxConcurrentTasks !== "number" || config.maxConcurrentTasks <= 0)
  ) {
    throw new BrowserConfigError("maxConcurrentTasks must be greater than zero");
  }

  return true;
}

export function validateUrl(url: string): true {
  if (typeof url !== "string" || url.trim().length === 0) {
    throw new ValidationError("url is required");
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new ValidationError("Only http and https URLs are supported");
    }
  } catch {
    throw new ValidationError("Invalid URL");
  }

  return true;
}

export function validateSessionInput(input: BrowserSessionInput): true {
  if (!input || typeof input.userId !== "string" || !input.userId.trim()) {
    throw new ValidationError("userId is required");
  }

  if (input.url !== undefined) {
    validateUrl(input.url);
  }

  return true;
}

export function validateTaskInput(input: BrowserTaskInput): true {
  if (!input || typeof input !== "object") {
    throw new ValidationError("task input is required");
  }

  if (
    typeof input.sessionId !== "string" ||
    input.sessionId.trim().length === 0
  ) {
    throw new ValidationError("sessionId is required");
  }

  if (typeof input.url !== "string" || input.url.trim().length === 0) {
    throw new ValidationError("url is required");
  }

  validateUrl(input.url);

  const operation =
    input.type ??
    input.action ??
    input.name ??
    "navigate";

  if (typeof operation !== "string" || operation.trim().length === 0) {
    throw new ValidationError("task operation is required");
  }

  return true;
}

export class BrowserSessionManager {
  private readonly sessions = new Map<string, BrowserSession>();

  create(input: BrowserSessionInput): BrowserSession {
    validateSessionInput(input);

    const timestamp = now();

    const session: BrowserSession = {
      id: randomUUID(),
      userId: input.userId,
      url: input.url ?? "about:blank",
      status: "created",
      createdAt: timestamp,
      updatedAt: timestamp,
      metadata: clone(input.metadata ?? {})
    };

    this.sessions.set(session.id, session);
    return clone(session);
  }

  get(id: string): BrowserSession {
    const session = this.sessions.get(id);

    if (!session) {
      throw new NotFoundError(`Session ${id} was not found`);
    }

    return clone(session);
  }

  require(id: string): BrowserSession {
    return this.get(id);
  }

  private requireMutable(id: string): BrowserSession {
    const session = this.sessions.get(id);

    if (!session) {
      throw new NotFoundError(`Session ${id} was not found`);
    }

    return session;
  }

  start(id: string): BrowserSession {
    const session = this.requireMutable(id);
    session.status = "running";
    session.updatedAt = now();
    return clone(session);
  }

  pause(id: string): BrowserSession {
    const session = this.requireMutable(id);
    session.status = "paused";
    session.updatedAt = now();
    return clone(session);
  }

  complete(id: string): BrowserSession {
    const session = this.requireMutable(id);
    session.status = "completed";
    session.updatedAt = now();
    return clone(session);
  }

  fail(id: string, message?: string): BrowserSession {
    const session = this.requireMutable(id);
    session.status = "failed";
    session.updatedAt = now();

    if (message) {
      session.metadata.error = message;
    }

    return clone(session);
  }

  close(id: string): BrowserSession {
    const session = this.requireMutable(id);
    session.status = "closed";
    session.updatedAt = now();
    return clone(session);
  }

  list(): BrowserSession[] {
    return [...this.sessions.values()].map(clone);
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }
}

export class BrowserTaskManager {
  private readonly tasks = new Map<string, BrowserTask>();

  create(input: BrowserTaskInput): BrowserTask {
    validateTaskInput(input);

    const timestamp = now();
    const type = input.type ?? input.action ?? input.name ?? "navigate";
    const action = input.action ?? input.type ?? input.name ?? "navigate";
    const name = input.name ?? type;

    const task: BrowserTask = {
      id: randomUUID(),
      sessionId: input.sessionId,
      userId: input.userId,
      url: input.url,
      type,
      action,
      name,
      input: clone(input.input ?? input.payload ?? {}),
      payload: clone(input.payload ?? input.input ?? {}),
      status: "queued",
      attempts: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.tasks.set(task.id, task);
    return clone(task);
  }

  get(id: string): BrowserTask {
    const task = this.tasks.get(id);

    if (!task) {
      throw new NotFoundError(`Task ${id} was not found`);
    }

    return clone(task);
  }

  require(id: string): BrowserTask {
    return this.get(id);
  }

  start(id: string): BrowserTask {
    const task = this.requireMutable(id);
    task.status = "running";
    task.attempts += 1;
    task.startedAt ??= now();
    task.updatedAt = now();
    return clone(task);
  }

  complete(id: string, output?: unknown): BrowserTask {
    const task = this.requireMutable(id);
    task.status = "completed";
    task.output = clone(output);
    task.result = clone(output);
    task.completedAt = now();
    task.updatedAt = now();
    return clone(task);
  }

  fail(id: string, error: string): BrowserTask {
    const task = this.requireMutable(id);
    task.status = "failed";
    task.error = error;
    task.completedAt = now();
    task.updatedAt = now();
    return clone(task);
  }

  cancel(id: string): BrowserTask {
    const task = this.requireMutable(id);
    task.status = "cancelled";
    task.completedAt = now();
    task.updatedAt = now();
    return clone(task);
  }

  list(): BrowserTask[] {
    return [...this.tasks.values()].map(clone);
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  private requireMutable(id: string): BrowserTask {
    const task = this.tasks.get(id);

    if (!task) {
      throw new NotFoundError(`Task ${id} was not found`);
    }

    return task;
  }
}

export class BrowserSessionRepository {
  private readonly sessions = new Map<string, BrowserSession>();

  constructor(manager?: BrowserSessionManager) {
    if (manager) {
      for (const s of manager.list()) {
        this.sessions.set(s.id, clone(s));
      }
    }
  }

  create(session: BrowserSession): BrowserSession {
    this.sessions.set(session.id, clone(session));
    return clone(session);
  }

  save(session: BrowserSession): BrowserSession {
    return this.create(session);
  }

  get(id: string): BrowserSession {
    const session = this.sessions.get(id);
    if (!session) {
      throw new NotFoundError(`Session ${id} not found in repository`);
    }
    return clone(session);
  }

  find(id: string): BrowserSession | undefined {
    const session = this.sessions.get(id);
    return session ? clone(session) : undefined;
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  list(): BrowserSession[] {
    return [...this.sessions.values()].map(clone);
  }
}

export class BrowserTaskRepository {
  private readonly tasks = new Map<string, BrowserTask>();

  constructor(manager?: BrowserTaskManager) {
    if (manager) {
      for (const t of manager.list()) {
        this.tasks.set(t.id, clone(t));
      }
    }
  }

  create(task: BrowserTask): BrowserTask {
    this.tasks.set(task.id, clone(task));
    return clone(task);
  }

  save(task: BrowserTask): BrowserTask {
    return this.create(task);
  }

  get(id: string): BrowserTask {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundError(`Task ${id} not found in repository`);
    }
    return clone(task);
  }

  find(id: string): BrowserTask | undefined {
    const task = this.tasks.get(id);
    return task ? clone(task) : undefined;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  list(): BrowserTask[] {
    return [...this.tasks.values()].map(clone);
  }
}

export class CredentialVault {
  private readonly credentials = new Map<string, BrowserCredential>();

  set(input: BrowserCredentialInput): BrowserCredential {
    return this.store(input);
  }

  store(input: BrowserCredentialInput): BrowserCredential {
    const key = (
      input.key ??
      input.name ??
      input.username ??
      ""
    ).trim();

    if (!key) {
      throw new ValidationError("credential key is required");
    }

    const timestamp = now();
    const existing = [...this.credentials.values()]
      .find((credential) => credential.key === key || credential.name === key);

    const credential: BrowserCredential = {
      id: existing?.id ?? randomUUID(),
      name: input.name ?? key,
      key,
      username: input.username,
      password: input.password,
      secret: input.secret,
      value: input.value ?? input.password ?? input.secret,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      metadata: clone(input.metadata ?? {})
    };

    this.credentials.set(credential.id, credential);
    return clone(credential);
  }

  get(id: string): BrowserCredential {
    const credential = this.credentials.get(id);
    if (!credential) {
      throw new NotFoundError(`Credential ${id} was not found`);
    }
    return clone(credential);
  }

  getByKey(key: string): BrowserCredential | undefined {
    const credential = [...this.credentials.values()]
      .find((c) => c.key === key || c.name === key || c.username === key);
    return credential ? clone(credential) : undefined;
  }

  getByName(name: string): BrowserCredential | undefined {
    return this.getByKey(name);
  }

  resolve(key: string): BrowserCredential | undefined {
    return this.getByKey(key);
  }

  delete(id: string): boolean {
    return this.credentials.delete(id);
  }

  list(): BrowserCredential[] {
    return [...this.credentials.values()].map(clone);
  }
}

export class CredentialManager {
  constructor(
    public readonly vault: CredentialVault = new CredentialVault()
  ) {}

  save(input: BrowserCredentialInput): BrowserCredential {
    return this.vault.store(input);
  }

  set(input: BrowserCredentialInput): BrowserCredential {
    return this.save(input);
  }

  get(id: string): BrowserCredential {
    return this.vault.get(id);
  }

  resolve(key: string): BrowserCredential | undefined {
    return this.vault.resolve(key);
  }

  getByKey(key: string): BrowserCredential | undefined {
    return this.vault.getByKey(key);
  }

  getByName(name: string): BrowserCredential | undefined {
    return this.vault.getByName(name);
  }

  delete(id: string): boolean {
    return this.vault.delete(id);
  }

  list(): BrowserCredential[] {
    return this.vault.list();
  }
}

export class CredentialResolver {
  constructor(
    private readonly provider: CredentialManager | CredentialVault = new CredentialVault()
  ) {}

  resolve(
    name: string,
    fallback?: BrowserCredential
  ): BrowserCredential | undefined {
    return this.provider.resolve(name) ?? fallback;
  }
}

export class DownloadStorage {
  private readonly downloads = new Map<string, Download>();

  save(download: Download): Download {
    this.downloads.set(download.id, clone(download));
    return clone(download);
  }

  get(id: string): Download | undefined {
    return clone(this.downloads.get(id));
  }

  delete(id: string): boolean {
    return this.downloads.delete(id);
  }

  list(): Download[] {
    return [...this.downloads.values()].map(clone);
  }
}

export class DownloadManager {
  constructor(
    private readonly storage: DownloadStorage = new DownloadStorage()
  ) {}

  create(input: Partial<Download> & { filename: string }): Download {
    return this.storage.save({
      ...clone(input),
      id: input.id ?? randomUUID(),
      filename: input.filename,
      createdAt: input.createdAt ?? now()
    });
  }

  save(input: Partial<Download> & { filename: string }): Download {
    return this.create(input);
  }

  get(id: string): Download | undefined {
    return this.storage.get(id);
  }

  list(): Download[] {
    return this.storage.list();
  }

  delete(id: string): boolean {
    return this.storage.delete(id);
  }
}

export class DownloadHandler {
  constructor(
    private readonly manager: DownloadManager = new DownloadManager()
  ) {}

  handle(input: {
    sessionId?: string;
    taskId?: string;
    url?: string;
    filename: string;
    content?: string;
  }): Download {
    return this.manager.create(input);
  }

  process(input: {
    sessionId?: string;
    taskId?: string;
    url?: string;
    filename: string;
    content?: string;
  }): Download {
    return this.handle(input);
  }
}

export class BrowserEventPublisher {
  private readonly events: BrowserEvent[] = [];
  private readonly listeners: Array<(event: BrowserEvent) => void | Promise<void>> = [];

  subscribe(listener: (event: BrowserEvent) => void | Promise<void>): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  publish(
    event:
      | string
      | Omit<BrowserEvent, "id" | "timestamp">
  ): BrowserEvent {
    const normalized: Omit<BrowserEvent, "id" | "timestamp"> =
      typeof event === "string"
        ? { type: event }
        : event;

    const created: BrowserEvent = {
      ...clone(normalized),
      id: randomUUID(),
      timestamp: now()
    };

    this.events.push(created);

    for (const listener of [...this.listeners]) {
      try {
        listener(clone(created));
      } catch {}
    }

    return clone(created);
  }

  list(): BrowserEvent[] {
    return this.events.map(clone);
  }

  findBySession(sessionId: string): BrowserEvent[] {
    return this.events
      .filter((event) => event.sessionId === sessionId)
      .map(clone);
  }

  findByTask(taskId: string): BrowserEvent[] {
    return this.events
      .filter((event) => event.taskId === taskId)
      .map(clone);
  }
}

export class BrowserEventHandler {
  private readonly handlers: Array<
    (event: BrowserEvent) => void | Promise<void>
  > = [];

  constructor(
    private readonly publisher?: BrowserEventPublisher
  ) {
    if (this.publisher) {
      this.publisher.subscribe((event) => {
        void this.handle(event);
      });
    }
  }

  on(
    handler: (event: BrowserEvent) => void | Promise<void>
  ): () => void {
    this.handlers.push(handler);

    return () => {
      const index = this.handlers.indexOf(handler);
      if (index >= 0) {
        this.handlers.splice(index, 1);
      }
    };
  }

  async handle(event: BrowserEvent): Promise<BrowserEvent> {
    for (const handler of this.handlers) {
      await handler(clone(event));
    }

    return event;
  }

  async emit(
    event: Omit<BrowserEvent, "id" | "timestamp">
  ): Promise<BrowserEvent> {
    if (this.publisher) {
      return this.publisher.publish(event);
    }
    const created: BrowserEvent = {
      ...clone(event),
      id: randomUUID(),
      timestamp: now()
    };
    await this.handle(created);
    return created;
  }
}

export class BrowserJobQueue {
  private readonly jobs: BrowserJob[] = [];

  enqueue(
    input:
      | string
      | {
          type: string;
          payload?: Record<string, unknown>;
        }
  ): BrowserJob {
    const normalized =
      typeof input === "string"
        ? { type: input, payload: {} }
        : input;

    const job: BrowserJob = {
      id: randomUUID(),
      type: normalized.type,
      payload: clone(normalized.payload ?? {}),
      status: "queued",
      createdAt: now()
    };

    this.jobs.push(job);
    return clone(job);
  }

  dequeue(): BrowserJob | undefined {
    const job = this.jobs.shift();

    if (!job) {
      return undefined;
    }

    job.status = "running";
    return clone(job);
  }

  size(): number {
    return this.jobs.length;
  }

  async process<T>(
    handler: (job: BrowserJob) => T | Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];

    while (this.jobs.length > 0) {
      const job = this.dequeue();

      if (!job) {
        break;
      }

      try {
        results.push(await handler(job));
        job.status = "completed";
      } catch {
        job.status = "failed";
        throw arguments;
      }
    }

    return results;
  }

  list(): BrowserJob[] {
    return this.jobs.map(clone);
  }
}

export class BrowserJobManager {
  constructor(
    private readonly queue: BrowserJobQueue = new BrowserJobQueue()
  ) {}

  create(input: {
    type: string;
    payload?: Record<string, unknown>;
  }): BrowserJob {
    return this.queue.enqueue(input);
  }

  enqueue(input: {
    type: string;
    payload?: Record<string, unknown>;
  }): BrowserJob {
    return this.create(input);
  }

  async run<T>(
    handler: (job: BrowserJob) => T | Promise<T>
  ): Promise<T[]> {
    return this.queue.process(handler);
  }
}

export class RetryPolicy {
  private readonly maxAttempts: number;
  private readonly delayMs: number;

  constructor(config: RetryPolicyConfig = {}) {
    this.maxAttempts =
      config.maxAttempts ??
      config.maxRetries ??
      3;

    this.delayMs = config.delayMs ?? 0;
  }

  shouldRetry(attempt: number): boolean {
    return attempt < this.maxAttempts;
  }

  canRetry(attempt: number): boolean {
    return this.shouldRetry(attempt);
  }

  async wait(): Promise<void> {
    if (this.delayMs > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.delayMs)
      );
    }
  }
}

export class FailureHandler {
  handle(
    error: unknown,
    context?: string | Record<string, unknown>
  ): BrowserResult<never> {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const taskId =
      typeof context === "string"
        ? context
        : typeof context === "object" && context !== null && "taskId" in context
          ? String(context.taskId)
          : undefined;

    const state =
      typeof context === "object" && context !== null
        ? clone(context)
        : {};

    return {
      ok: false,
      success: false,
      error: message,
      taskId,
      state
    };
  }
}

export class CheckpointManager {
  private readonly checkpoints = new Map<string, BrowserCheckpoint>();

  save(
    taskIdOrInput:
      | string
      | {
          sessionId?: string;
          taskId?: string;
          state?: Record<string, unknown>;
        },
    state: Record<string, unknown> = {}
  ): BrowserCheckpoint {
    let taskId: string | undefined;
    let sessionId: string | undefined;
    let checkpointState = state;

    if (typeof taskIdOrInput === "string") {
      taskId = taskIdOrInput;
    } else if (taskIdOrInput && typeof taskIdOrInput === "object") {
      taskId = taskIdOrInput.taskId;
      sessionId = taskIdOrInput.sessionId;
      checkpointState = taskIdOrInput.state ?? {};
    }

    const checkpoint: BrowserCheckpoint = {
      id: randomUUID(),
      sessionId,
      taskId,
      state: clone(checkpointState),
      createdAt: now()
    };

    this.checkpoints.set(checkpoint.id, checkpoint);
    return clone(checkpoint);
  }

  get(id: string): BrowserCheckpoint {
    const cp = this.checkpoints.get(id);
    if (!cp) {
      throw new NotFoundError(`Checkpoint ${id} was not found`);
    }
    return clone(cp);
  }

  restore(id: string): BrowserCheckpoint {
    return this.get(id);
  }

  latest(taskId: string): BrowserCheckpoint | undefined {
    const values = [...this.checkpoints.values()]
      .filter((checkpoint) => checkpoint.taskId === taskId || checkpoint.id === taskId);

    const last = values.at(-1);
    return last ? clone(last) : undefined;
  }
}

export class RecoveryManager {
  constructor(
    private readonly checkpoints: CheckpointManager = new CheckpointManager(),
    private readonly failures: FailureHandler = new FailureHandler()
  ) {}

  recover(
    checkpointIdOrTaskId: string,
    state: Record<string, unknown> = {}
  ): BrowserResult<BrowserCheckpoint> {
    let checkpoint: BrowserCheckpoint | undefined;

    try {
      checkpoint = this.checkpoints.get(checkpointIdOrTaskId);
    } catch {
      checkpoint = this.checkpoints.latest(checkpointIdOrTaskId);
    }

    if (!checkpoint) {
      checkpoint = this.checkpoints.save(checkpointIdOrTaskId, state);
    }

    return {
      ok: true,
      success: true,
      data: checkpoint,
      taskId: checkpoint.taskId,
      sessionId: checkpoint.sessionId,
      state: clone(checkpoint.state)
    };
  }

  handleFailure(
    error: unknown,
    context?: string | Record<string, unknown>
  ): BrowserResult<never> {
    return this.failures.handle(error, context);
  }
}

export class PermissionManager {
  private readonly permissions = new Set<string>();

  grant(userId: string, permission: string): void {
    this.permissions.add(`${userId}:${permission}`);
  }

  require(
    userId: string,
    permission: string
  ): true {
    if (!this.permissions.has(`${userId}:${permission}`)) {
      throw new PermissionError(
        `Permission denied: ${permission}`
      );
    }

    return true;
  }

  has(userId: string, permission: string): boolean {
    return this.permissions.has(`${userId}:${permission}`);
  }
}

export class BrowserAuthMiddleware {
  constructor(
    private readonly permissions: PermissionManager = new PermissionManager()
  ) {}

  authenticate(input: {
    userId?: string;
    permission?: string;
    [key: string]: unknown;
  }): { userId: string; [key: string]: unknown } {
    if (!input.userId) {
      throw new AuthenticationError("userId is required");
    }

    if (input.permission) {
      this.permissions.require(
        input.userId,
        input.permission
      );
    }

    return {
      ...clone(input),
      userId: input.userId
    };
  }
}

export class BrowserValidationMiddleware {
  validate<T extends Record<string, unknown>>(input: T): T {
    if (!input || typeof input !== "object") {
      throw new ValidationError("input is required");
    }

    if ("url" in input && typeof input.url === "string") {
      validateUrl(input.url);
    }

    if ("sessionId" in input && typeof input.sessionId === "string" && input.sessionId.trim().length === 0) {
      throw new ValidationError("sessionId is required");
    }

    if ("userId" in input && typeof input.userId === "string" && input.userId.trim().length === 0) {
      throw new ValidationError("userId is required");
    }

    return clone(input);
  }
}

export class BrowserRepository {
  public readonly sessions: BrowserSessionRepository;
  public readonly tasks: BrowserTaskRepository;

  constructor(
    sessions: BrowserSessionRepository = new BrowserSessionRepository(),
    tasks: BrowserTaskRepository = new BrowserTaskRepository()
  ) {
    this.sessions = sessions;
    this.tasks = tasks;
  }
}

export class BrowserTaskWorker {
  constructor(
    private readonly sessions: BrowserSessionManager = browserSessionManager,
    private readonly tasks: BrowserTaskManager = browserTaskManager,
    private readonly eventsOrJobs?: BrowserEventPublisher | BrowserJobManager | BrowserJobQueue
  ) {}

  async execute(taskId: string): Promise<BrowserTask> {
    const task = this.tasks.require(taskId);

    try {
      try {
        this.sessions.start(task.sessionId);
      } catch {}

      const running = this.tasks.start(task.id);

      if (this.eventsOrJobs && "publish" in this.eventsOrJobs && typeof this.eventsOrJobs.publish === "function") {
        this.eventsOrJobs.publish({
          type: "task.started",
          sessionId: running.sessionId,
          taskId: running.id,
          userId: running.userId
        });
      }

      const output = {
        url: running.url,
        action: running.action,
        input: clone(running.input),
        executed: true
      };

      const completed = this.tasks.complete(
        running.id,
        output
      );

      try {
        this.sessions.complete(running.sessionId);
      } catch {}

      if (this.eventsOrJobs && "publish" in this.eventsOrJobs && typeof this.eventsOrJobs.publish === "function") {
        this.eventsOrJobs.publish({
          type: "task.completed",
          sessionId: completed.sessionId,
          taskId: completed.id,
          userId: completed.userId,
          data: { output }
        });
      }

      return completed;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      try {
        this.tasks.fail(task.id, message);
        this.sessions.fail(task.sessionId, message);
      } catch {}

      if (this.eventsOrJobs && "publish" in this.eventsOrJobs && typeof this.eventsOrJobs.publish === "function") {
        this.eventsOrJobs.publish({
          type: "task.failed",
          sessionId: task.sessionId,
          taskId: task.id,
          userId: task.userId,
          data: { error: message }
        });
      }

      throw error;
    }
  }
}

export class BrowserWorker {
  constructor(
    private readonly worker: BrowserTaskWorker = new BrowserTaskWorker()
  ) {}

  async run(taskId: string): Promise<BrowserTask> {
    return this.worker.execute(taskId);
  }

  async execute(taskId: string): Promise<BrowserTask> {
    return this.run(taskId);
  }
}

export class BrowserOrchestrator {
  private readonly worker: BrowserTaskWorker;

  constructor(
    public readonly sessions: BrowserSessionManager = browserSessionManager,
    public readonly tasks: BrowserTaskManager = browserTaskManager,
    eventsOrWorker?: BrowserEventPublisher | BrowserTaskWorker | BrowserJobManager
  ) {
    if (eventsOrWorker instanceof BrowserTaskWorker) {
      this.worker = eventsOrWorker;
    } else {
      this.worker = new BrowserTaskWorker(this.sessions, this.tasks, eventsOrWorker);
    }
  }

  createSession(input: BrowserSessionInput): BrowserSession {
    return this.sessions.create(input);
  }

  createTask(input: BrowserTaskInput): BrowserTask {
    return this.tasks.create(input);
  }

  async execute(
    taskIdOrInput: string | BrowserTaskInput
  ): Promise<BrowserTask> {
    const taskId =
      typeof taskIdOrInput === "string"
        ? taskIdOrInput
        : this.createTask(taskIdOrInput).id;

    return this.worker.execute(taskId);
  }

  async executeTask(taskId: string): Promise<BrowserTask> {
    return this.execute(taskId);
  }
}

export class BrowserController {
  private readonly sessions: BrowserSessionManager;
  private readonly orchestrator: BrowserOrchestrator;

  constructor(
    sessionsOrOrchestrator: BrowserSessionManager | BrowserOrchestrator = browserOrchestrator,
    orchestrator?: BrowserOrchestrator
  ) {
    if (sessionsOrOrchestrator instanceof BrowserOrchestrator) {
      this.orchestrator = sessionsOrOrchestrator;
      this.sessions = sessionsOrOrchestrator.sessions;
    } else {
      this.sessions = sessionsOrOrchestrator;
      this.orchestrator = orchestrator ?? browserOrchestrator;
    }
  }

  createSession(input: BrowserSessionInput): BrowserSession {
    return this.sessions.create(input);
  }

  createTask(input: BrowserTaskInput): BrowserTask {
    return this.orchestrator.createTask(input);
  }

  async execute(input: BrowserTaskInput | string): Promise<BrowserTask> {
    return this.orchestrator.execute(input);
  }
}

export class TaskController {
  private readonly tasks: BrowserTaskManager;
  private readonly orchestrator: BrowserOrchestrator;

  constructor(
    tasksOrOrchestrator: BrowserTaskManager | BrowserOrchestrator = browserOrchestrator,
    orchestrator?: BrowserOrchestrator
  ) {
    if (tasksOrOrchestrator instanceof BrowserOrchestrator) {
      this.orchestrator = tasksOrOrchestrator;
      this.tasks = tasksOrOrchestrator.tasks;
    } else {
      this.tasks = tasksOrOrchestrator;
      this.orchestrator = orchestrator ?? browserOrchestrator;
    }
  }

  createTask(input: BrowserTaskInput): BrowserTask {
    return this.tasks.create(input);
  }

  async executeTask(taskId: string): Promise<BrowserTask> {
    return this.orchestrator.execute(taskId);
  }
}

export class BrowserTelemetry {
  private readonly events: any[] = [];

  record(
    event: any,
    data: Record<string, unknown> = {}
  ): any {
    const entry = typeof event === "string" ? { type: event, ...data } : event;
    this.events.push(clone(entry));
    return clone(entry);
  }

  getEvents(): any[] {
    return this.events.map(clone);
  }

  list(): any[] {
    return this.getEvents();
  }
}

export class BrowserMetrics {
  private readonly values = new Map<string, number>();

  increment(name: string, value = 1): number {
    const next = (this.values.get(name) ?? 0) + value;
    this.values.set(name, next);
    return next;
  }

  record(name: string, value = 1): number {
    return this.increment(name, value);
  }

  get(name: string): number {
    return this.values.get(name) ?? 0;
  }

  getAll(): Record<string, number> {
    return Object.fromEntries(this.values.entries());
  }
}

export class BrowserWorkerPool {
  constructor(
    private readonly worker: BrowserWorker = new BrowserWorker(),
    private readonly concurrency: number = 2
  ) {}

  async run(
    taskIds: string[],
    concurrency = this.concurrency
  ): Promise<BrowserTask[]> {
    const results: BrowserTask[] = [];
    const limit = Math.max(1, concurrency || 1);

    for (let index = 0; index < taskIds.length; index += limit) {
      const batch = taskIds.slice(index, index + limit);
      const batchResults = await Promise.all(
        batch.map((taskId) => this.worker.run(taskId))
      );
      results.push(...batchResults);
    }

    return results;
  }
}

export class BrowserEngine {
  constructor(
    public readonly orchestrator: BrowserOrchestrator = new BrowserOrchestrator()
  ) {}

  createSession(input: BrowserSessionInput): BrowserSession {
    return this.orchestrator.createSession(input);
  }

  createTask(input: BrowserTaskInput): BrowserTask {
    return this.orchestrator.createTask(input);
  }

  async runTask(
    taskIdOrInput: string | BrowserTaskInput
  ): Promise<BrowserTask> {
    return this.orchestrator.execute(taskIdOrInput);
  }

  async execute(
    taskIdOrInput: string | BrowserTaskInput
  ): Promise<BrowserTask> {
    return this.runTask(taskIdOrInput);
  }
}

export class BrowserService {
  constructor(
    public readonly engine: BrowserEngine = new BrowserEngine()
  ) {}

  createSession(input: BrowserSessionInput): BrowserSession {
    return this.engine.createSession(input);
  }

  createTask(input: BrowserTaskInput): BrowserTask {
    return this.engine.createTask(input);
  }

  async runTask(
    taskIdOrInput: string | BrowserTaskInput
  ): Promise<BrowserTask> {
    return this.engine.runTask(taskIdOrInput);
  }
}

export const browserSessionManager =
  new BrowserSessionManager();

export const browserTaskManager =
  new BrowserTaskManager();

export const browserEventPublisher =
  new BrowserEventPublisher();

export const browserCredentialVault =
  new CredentialVault();

export const browserCredentialManager =
  new CredentialManager(browserCredentialVault);

export const browserDownloadManager =
  new DownloadManager();

export const browserJobManager =
  new BrowserJobManager();

export const browserRecoveryManager =
  new RecoveryManager();

export const browserPermissionManager =
  new PermissionManager();

export const browserOrchestrator =
  new BrowserOrchestrator(
    browserSessionManager,
    browserTaskManager,
    browserEventPublisher
  );

export const browserEngine =
  new BrowserEngine(browserOrchestrator);

export const browserService =
  new BrowserService(browserEngine);

export function createBrowserEngine(
  config: Partial<BrowserConfig> = {}
): BrowserEngine {
  const normalized = createBrowserConfig(config);
  validateBrowserConfig(normalized);

  return new BrowserEngine(
    new BrowserOrchestrator(
      new BrowserSessionManager(),
      new BrowserTaskManager(),
      new BrowserEventPublisher()
    )
  );
}
