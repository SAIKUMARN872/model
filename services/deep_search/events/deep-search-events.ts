export interface DeepSearchEventMap {
  "search.started": { researchId: string; query: string };
  "search.completed": { researchId: string; sourceCount: number };
  "search.failed": { researchId: string; error: string };
}

type Listener<T> = (payload: T) => void;

export class DeepSearchEventEmitter {
  private readonly listeners = new Map<keyof DeepSearchEventMap, Set<Listener<never>>>();

  on<K extends keyof DeepSearchEventMap>(
    event: K,
    listener: Listener<DeepSearchEventMap[K]>,
  ): () => void {
    let bucket = this.listeners.get(event);
    if (!bucket) {
      bucket = new Set<Listener<never>>();
      this.listeners.set(event, bucket);
    }
    bucket.add(listener as Listener<never>);
    return () => bucket?.delete(listener as Listener<never>);
  }

  emit<K extends keyof DeepSearchEventMap>(event: K, payload: DeepSearchEventMap[K]): void {
    const bucket = this.listeners.get(event);
    if (!bucket) return;
    for (const listener of [...bucket]) {
      (listener as Listener<DeepSearchEventMap[K]>)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const deepSearchEvents = new DeepSearchEventEmitter();
