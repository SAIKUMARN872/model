import { MemoryService } from "../services/memory-service.js";
import type {
  CreateMemoryInput,
  UpdateMemoryInput,
} from "../schemas/memory-schema.js";

export class MemoryController {
  constructor(private readonly service: MemoryService = new MemoryService()) {}

  create(input: CreateMemoryInput) {
    return this.service.create(input);
  }

  get(id: string) {
    return this.service.get(id);
  }

  getByKey(key: string) {
    return this.service.getByKey(key);
  }

  list() {
    return this.service.list();
  }

  update(id: string, input: UpdateMemoryInput) {
    return this.service.update(id, input);
  }

  delete(id: string): boolean {
    return this.service.delete(id);
  }

  count(): number {
    return this.service.count();
  }
}
