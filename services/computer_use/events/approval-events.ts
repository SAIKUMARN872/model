import { randomUUID } from "node:crypto";
import type { ComputerEvent } from "../interfaces.js";

export class ApprovalEventEmitter {
  private readonly listeners = new Set<(event: ComputerEvent) => void>();
  on(listener: (event: ComputerEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type: string, sessionId: string, payload: unknown): ComputerEvent {
    const event: ComputerEvent = {
      id: randomUUID(), type, timestamp: new Date(), sessionId, payload
    };
    for (const listener of this.listeners) listener(event);
    return event;
  }
}
export const approvalEvents = new ApprovalEventEmitter();
