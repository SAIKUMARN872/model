export class StorageManager {
  private storage: Map<string, unknown> = new Map();

  public set<T>(
    key: string,
    value: T
  ): void {
    if (!key.trim()) {
      throw new Error(
        "Storage key is required."
      );
    }

    this.storage.set(key, value);
  }

  public get<T>(
    key: string
  ): T | undefined {
    return this.storage.get(key) as
      | T
      | undefined;
  }

  public has(
    key: string
  ): boolean {
    return this.storage.has(key);
  }

  public remove(
    key: string
  ): boolean {
    return this.storage.delete(key);
  }

  public clear(): void {
    this.storage.clear();
  }

  public size(): number {
    return this.storage.size;
  }

  public getAll(): Record<
    string,
    unknown
  > {
    const result: Record<
      string,
      unknown
    > = {};

    this.storage.forEach(
      (value, key) => {
        result[key] = value;
      }
    );

    return result;
  }
}

const storageManager =
  new StorageManager();

export default storageManager;