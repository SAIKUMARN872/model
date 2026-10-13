import { NotFoundError, ValidationError } from "../exceptions.js";
import { createScreenshot } from "../models.js";
import type { ScreenshotRecord, SessionRecord } from "../interfaces.js";
import { ScreenshotRepository } from "../repository/screenshot-repository.js";
import { loadComputerUseConfig } from "../config/config.js";

export class ScreenshotService {
  constructor(
    private readonly repository = new ScreenshotRepository(),
    private readonly config = loadComputerUseConfig()
  ) {}

  save(session: SessionRecord, data: string, mimeType = "image/png"): ScreenshotRecord {
    if (session.status !== "active") {
      throw new ValidationError("Session must be active to capture a screenshot");
    }
    if (!data.trim()) throw new ValidationError("Screenshot data is required");
    if (!/^image\/(png|jpeg|webp)$/.test(mimeType)) {
      throw new ValidationError("Unsupported screenshot mime type");
    }
    const screenshot = createScreenshot({
      sessionId: session.id,
      data,
      mimeType
    });
    return this.repository.save(screenshot);
  }

  get(id: string): ScreenshotRecord {
    const record = this.repository.get(id);
    if (!record) throw new NotFoundError("Screenshot", id);
    return record;
  }

  listBySession(sessionId: string): ScreenshotRecord[] {
    return this.repository.listBySession(sessionId)
      .slice(-this.config.maxScreenshots);
  }
}
