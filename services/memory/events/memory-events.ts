export type MemoryEventType =
  | "memory.created"
  | "memory.updated"
  | "memory.deleted";

export interface MemoryEvent<T = unknown> {
  type: MemoryEventType;
  memoryId: string;
  timestamp: number;
  payload?: T;
}

export type MemoryEventListener = (event: MemoryEvent) => void;
