export interface SyncItem {
  id: string;
  data: unknown;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export class SyncManager {
  private items: Map<
    string,
    SyncItem
  > = new Map();

  private syncing = false;

  public add(
    id: string,
    data: unknown
  ): SyncItem {
    if (!id.trim()) {
      throw new Error(
        "Sync item ID is required."
      );
    }

    const now =
      new Date().toISOString();

    const item: SyncItem = {
      id,
      data,
      synced: false,
      createdAt: now,
      updatedAt: now,
    };

    this.items.set(id, item);

    return item;
  }

  public update(
    id: string,
    data: unknown
  ): SyncItem | undefined {
    const item =
      this.items.get(id);

    if (!item) {
      return undefined;
    }

    item.data = data;
    item.synced = false;
    item.updatedAt =
      new Date().toISOString();

    this.items.set(id, item);

    return item;
  }

  public get(
    id: string
  ): SyncItem | undefined {
    return this.items.get(id);
  }

  public getPending(): SyncItem[] {
    return Array.from(
      this.items.values()
    ).filter(
      (item) => !item.synced
    );
  }

  public async sync(): Promise<void> {
    if (this.syncing) {
      return;
    }

    this.syncing = true;

    try {
      const pendingItems =
        this.getPending();

      for (const item of pendingItems) {
        await this.syncItem(item);
      }
    } finally {
      this.syncing = false;
    }
  }

  private async syncItem(
    item: SyncItem
  ): Promise<void> {
    await Promise.resolve();

    item.synced = true;
    item.updatedAt =
      new Date().toISOString();

    this.items.set(
      item.id,
      item
    );
  }

  public isSyncing(): boolean {
    return this.syncing;
  }

  public remove(
    id: string
  ): boolean {
    return this.items.delete(id);
  }

  public clear(): void {
    this.items.clear();
  }

  public count(): number {
    return this.items.size;
  }
}

const syncManager =
  new SyncManager();

export default syncManager;