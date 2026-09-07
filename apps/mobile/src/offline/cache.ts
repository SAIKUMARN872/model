export class Cache<T> {
  private store: Map<
    string,
    {
      value: T;
      expiresAt?: number;
    }
  > = new Map();

  public set(
    key: string,
    value: T,
    ttl?: number
  ): void {
    if (!key.trim()) {
      throw new Error(
        "Cache key is required."
      );
    }

    const expiresAt =
      ttl !== undefined
        ? Date.now() + ttl
        : undefined;

    this.store.set(key, {
      value,
      expiresAt,
    });
  }

  public get(
    key: string
  ): T | undefined {
    const item =
      this.store.get(key);

    if (!item) {
      return undefined;
    }

    if (
      item.expiresAt !== undefined &&
      Date.now() > item.expiresAt
    ) {
      this.store.delete(key);

      return undefined;
    }

    return item.value;
  }

  public has(
    key: string
  ): boolean {
    return this.get(key) !== undefined;
  }

  public delete(
    key: string
  ): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  public size(): number {
    return this.store.size;
  }
}

const cache =
  new Cache<unknown>();

export default cache;