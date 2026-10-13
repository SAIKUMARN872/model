import { NotFoundError, ValidationError } from "../exceptions.js";
import { createComputer } from "../models.js";
import { validateComputer } from "../schemas.js";
import type { ComputerDevice } from "../interfaces.js";
import { ComputerRepository } from "../repository/computer-repository.js";
import { computerEvents } from "../events/computer-events.js";

export class ComputerService {
  constructor(private readonly repository = new ComputerRepository()) {}

  register(input: Omit<ComputerDevice, "id"> & { id?: string }): ComputerDevice {
    const computer = createComputer(input);
    validateComputer(computer);
    if (this.repository.get(computer.id)) {
      throw new ValidationError(`Computer already exists: ${computer.id}`);
    }
    this.repository.save(computer);
    computerEvents.emit("computer.registered", computer.id, { name: computer.name });
    return computer;
  }

  get(id: string): ComputerDevice {
    const computer = this.repository.get(id);
    if (!computer) throw new NotFoundError("Computer", id);
    return computer;
  }

  list(): ComputerDevice[] { return this.repository.list(); }

  setConnected(id: string, connected: boolean): ComputerDevice {
    const computer = this.get(id);
    computer.connected = connected;
    this.repository.save(computer);
    computerEvents.emit("computer.connection_changed", id, { connected });
    return computer;
  }

  remove(id: string): void {
    if (!this.repository.delete(id)) throw new NotFoundError("Computer", id);
  }
}
