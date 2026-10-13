import type { MemoryEvent, MemoryEventListener } from "../events/memory-events.js";
import { MemoryRepository } from "../repository/memory-repository.js";
import type {
  CreateMemoryInput,
  MemoryRecord,
  UpdateMemoryInput,
} from "../schemas/memory-schema.js";

export class MemoryService {
  private readonly listeners = new Set<MemoryEventListener>();

  constructor(
    private readonly repository: MemoryRepository = new MemoryRepository(),
  ) {}

  create(input: CreateMemoryInput): MemoryRecord {
    const record = this.repository.create(input);
    this.emit({
      type: "memory.created",
      memoryId: record.id,
      timestamp: Date.now(),
      payload: record,
    });
    return record;
  }

  get(id: string): MemoryRecord | undefined {
    return this.repository.getById(id);
  }

  getByKey(key: string): MemoryRecord | undefined {
    return this.repository.getByKey(key);
  }

  list(): MemoryRecord[] {
    return this.repository.list();
  }

  update(id: string, input: UpdateMemoryInput): MemoryRecord | undefined {
    const record = this.repository.update(id, input);
    if (record) {
      this.emit({
        type: "memory.updated",
        memoryId: id,
        timestamp: Date.now(),
        payload: record,
      });
    }
    return record;
  }

  delete(id: string): boolean {
    const deleted = this.repository.delete(id);
    if (deleted) {
      this.emit({
        type: "memory.deleted",
        memoryId: id,
        timestamp: Date.now(),
      });
    }
    return deleted;
  }

  subscribe(listener: MemoryEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  count(): number {
    return this.repository.count();
  }

  private emit(event: MemoryEvent): void {
    for (const listener of this.listeners) {
      listener(structuredClone(event));
    }
  }
}
