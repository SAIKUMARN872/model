export interface Repository<T> {
  create(item: T): T;
  findById(id: string): T | undefined;
  findAll(): T[];
  update(id: string, item: Partial<T>): T | undefined;
  delete(id: string): boolean;
}

export class InMemoryRepository<T extends { id: string }>
  implements Repository<T>
{
  private items: Map<string, T> = new Map();

  public create(item: T): T {
    if (!item.id) {
      throw new Error("Item ID is required.");
    }

    this.items.set(item.id, item);

    return item;
  }

  public findById(id: string): T | undefined {
    return this.items.get(id);
  }

  public findAll(): T[] {
    return Array.from(this.items.values());
  }

  public update(
    id: string,
    updates: Partial<T>
  ): T | undefined {
    const existing = this.items.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: T = {
      ...existing,
      ...updates,
      id,
    };

    this.items.set(id, updated);

    return updated;
  }

  public delete(id: string): boolean {
    return this.items.delete(id);
  }

  public clear(): void {
    this.items.clear();
  }

  public count(): number {
    return this.items.size;
  }
}

export class RepositoryFactory {
  private repositories: Map<
    string,
    Repository<any>
  > = new Map();

  public create<T extends { id: string }>(
    name: string
  ): Repository<T> {
    if (!name.trim()) {
      throw new Error("Repository name is required.");
    }

    if (!this.repositories.has(name)) {
      this.repositories.set(
        name,
        new InMemoryRepository<T>()
      );
    }

    return this.repositories.get(
      name
    ) as Repository<T>;
  }

  public has(name: string): boolean {
    return this.repositories.has(name);
  }

  public remove(name: string): boolean {
    return this.repositories.delete(name);
  }

  public clear(): void {
    this.repositories.clear();
  }

  public count(): number {
    return this.repositories.size;
  }
}

const repositoryFactory = new RepositoryFactory();

export default repositoryFactory;