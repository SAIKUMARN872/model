import { SessionService } from "../session-service.js";

export class SessionController {
  constructor(private readonly service = new SessionService()) {}

  create(input: { name: string }) {
    return this.service.create(input);
  }

  get(id: string) {
    return this.service.getById(id);
  }

  list() {
    return this.service.list();
  }

  delete(id: string) {
    return this.service.delete(id);
  }
}
