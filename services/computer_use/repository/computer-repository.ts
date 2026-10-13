import type { ComputerDevice } from "../interfaces.js";
export class ComputerRepository {
  private readonly records = new Map<string, ComputerDevice>();
  save(record: ComputerDevice): ComputerDevice {
    this.records.set(record.id, structuredClone(record));
    return structuredClone(record);
  }
  get(id: string): ComputerDevice | undefined {
    const value = this.records.get(id);
    return value ? structuredClone(value) : undefined;
  }
  list(): ComputerDevice[] {
    return [...this.records.values()].map((item) => structuredClone(item));
  }
  delete(id: string): boolean { return this.records.delete(id); }
}
