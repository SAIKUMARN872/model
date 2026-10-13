import type { SdkRelease } from "./sdk-schema.js";

function clone(item: SdkRelease): SdkRelease {
  return { ...item, releasedAt: new Date(item.releasedAt) };
}

export class SdkRepository {
  private readonly items = new Map<string, SdkRelease>();

  save(item: SdkRelease): SdkRelease {
    const copy = clone(item);
    this.items.set(copy.id, copy);
    return clone(copy);
  }

  getById(id: string): SdkRelease | undefined {
    const item = this.items.get(id);
    return item ? clone(item) : undefined;
  }

  list(): SdkRelease[] {
    return [...this.items.values()].map(clone);
  }

  findByPackageAndVersion(packageName: string, version: string): SdkRelease | undefined {
    const item = [...this.items.values()].find(
      (entry) => entry.packageName === packageName && entry.version === version,
    );
    return item ? clone(item) : undefined;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
