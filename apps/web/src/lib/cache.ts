class Cache {
  private cache = new Map<string, unknown>();

  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  get<T>(key: string): T | null {
    return (this.cache.get(key) as T) ?? null;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  keys(): string[] {
    return [...this.cache.keys()];
  }
}

const cache = new Cache();

export default cache;