import type { ActionInput, ActionRecord, ComputerDevice } from "../interfaces.js";
import { ActionService } from "./action-service.js";
import { ComputerService } from "./computer-service.js";
import { SessionService } from "./session-service.js";
import { ScreenshotService } from "./screenshot-service.js";
import { ApprovalService } from "./approval-service.js";
import { VerificationService } from "./verification-service.js";

export class ComputerUseService {
  readonly computers = new ComputerService();
  readonly sessions = new SessionService(this.computers);
  readonly actions = new ActionService();
  readonly screenshots = new ScreenshotService();
  readonly approvals = new ApprovalService();
  readonly verification = new VerificationService(this.actions);

  registerComputer(input: Omit<ComputerDevice, "id"> & { id?: string }): ComputerDevice {
    return this.computers.register(input);
  }
  createSession(computerId: string, metadata?: Record<string, unknown>) {
    return this.sessions.create(computerId, metadata);
  }
  startSession(sessionId: string) { return this.sessions.start(sessionId); }
  async executeAction(computerId: string, sessionId: string, input: ActionInput, approved = false): Promise<ActionRecord> {
    const computer = this.computers.get(computerId);
    const session = this.sessions.get(sessionId);
    return this.actions.execute(computer, session, input, approved);
  }
  captureScreenshot(sessionId: string, data: string, mimeType?: string) {
    return this.screenshots.save(this.sessions.get(sessionId), data, mimeType);
  }
}
