export interface DatabaseRecord {
  id: string;
  [key: string]: unknown;
}

export class Database {
  private tables: Map<
    string,
    Map<string, DatabaseRecord>
  > = new Map();

  public createTable(
    tableName: string
  ): void {
    if (!tableName.trim()) {
      throw new Error(
        "Table name is required."
      );
    }

    if (!this.tables.has(tableName)) {
      this.tables.set(
        tableName,
        new Map<string, DatabaseRecord>()
      );
    }
  }

  public insert<T extends DatabaseRecord>(
    tableName: string,
    record: T
  ): T {
    this.createTable(tableName);

    const table =
      this.tables.get(tableName)!;

    table.set(record.id, record);

    return record;
  }

  public findById<T extends DatabaseRecord>(
    tableName: string,
    id: string
  ): T | undefined {
    const table =
      this.tables.get(tableName);

    if (!table) {
      return undefined;
    }

    return table.get(id) as T | undefined;
  }

  public findAll<T extends DatabaseRecord>(
    tableName: string
  ): T[] {
    const table =
      this.tables.get(tableName);

    if (!table) {
      return [];
    }

    return Array.from(
      table.values()
    ) as T[];
  }

  public update<T extends DatabaseRecord>(
    tableName: string,
    id: string,
    updates: Partial<T>
  ): T | undefined {
    const existing =
      this.findById<T>(
        tableName,
        id
      );

    if (!existing) {
      return undefined;
    }

    const updated = {
      ...existing,
      ...updates,
      id,
    } as T;

    this.insert(
      tableName,
      updated
    );

    return updated;
  }

  public delete(
    tableName: string,
    id: string
  ): boolean {
    const table =
      this.tables.get(tableName);

    if (!table) {
      return false;
    }

    return table.delete(id);
  }

  public clearTable(
    tableName: string
  ): void {
    const table =
      this.tables.get(tableName);

    if (table) {
      table.clear();
    }
  }

  public dropTable(
    tableName: string
  ): boolean {
    return this.tables.delete(
      tableName
    );
  }

  public tableExists(
    tableName: string
  ): boolean {
    return this.tables.has(
      tableName
    );
  }

  public getTableCount(): number {
    return this.tables.size;
  }

  public clear(): void {
    this.tables.clear();
  }
}

const database = new Database();

export default database;