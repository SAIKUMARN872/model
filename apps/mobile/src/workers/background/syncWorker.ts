export interface SyncTask {
  id: string;
  data: unknown;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

export class SyncWorker {
  private queue: SyncTask[] = [];

  private running = false;

  public addTask(
    data: unknown
  ): SyncTask {
    const task: SyncTask = {
      id: this.generateId(),
      data,
      status: "pending",
      createdAt:
        new Date().toISOString(),
    };

    this.queue.push(task);

    return task;
  }

  public async process(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const pendingTasks =
        this.queue.filter(
          (task) =>
            task.status === "pending"
        );

      for (const task of pendingTasks) {
        await this.processTask(task);
      }
    } finally {
      this.running = false;
    }
  }

  private async processTask(
    task: SyncTask
  ): Promise<void> {
    task.status = "processing";

    try {
      await Promise.resolve();

      task.status = "completed";
    } catch {
      task.status = "failed";
    }
  }

  public getTasks(): SyncTask[] {
    return [...this.queue];
  }

  public getPendingTasks(): SyncTask[] {
    return this.queue.filter(
      (task) =>
        task.status === "pending"
    );
  }

  public isRunning(): boolean {
    return this.running;
  }

  public clear(): void {
    this.queue = [];
  }

  public count(): number {
    return this.queue.length;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const syncWorker =
  new SyncWorker();

export default syncWorker;