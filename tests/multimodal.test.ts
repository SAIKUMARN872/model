import { beforeEach, describe, expect, it } from "vitest";

import { AudioService } from "../services/multimodal/audio-service.js";
import { DocumentService } from "../services/multimodal/document-service.js";
import { ImageService } from "../services/multimodal/image-service.js";
import { TextService } from "../services/multimodal/text-service.js";
import { VideoService } from "../services/multimodal/video-service.js";
import { ProcessingService } from "../services/multimodal/processing-service.js";
import { SessionService } from "../services/multimodal/session-service.js";
import { ResultService } from "../services/multimodal/result-service.js";
import { JobManager } from "../services/multimodal/jobs/job-manager.js";
import { MultimodalWorker } from "../services/multimodal/workers/multimodal-worker.js";

describe("Multimodal module mock tests", () => {
  it("processes text and counts words", async () => {
    const result = await new TextService().process({ text: "hello world" });
    expect(result.wordCount).toBe(2);
    expect(result.characterCount).toBe(11);
  });

  it("rejects empty text", async () => {
    await expect(new TextService().process({ text: " " })).rejects.toThrow();
  });

  it("processes mock audio", async () => {
    const result = await new AudioService().process({
      filename: "sample.wav",
      mimeType: "audio/wav",
      content: "mock-audio",
    });
    expect(result.transcript).toBeTruthy();
  });

  it("processes a document", async () => {
    const result = await new DocumentService().process({
      filename: "sample.txt",
      mimeType: "text/plain",
      content: "document body",
    });
    expect(result.extractedText).toBe("document body");
  });

  it("processes a mock image", async () => {
    const result = await new ImageService().process({
      filename: "sample.png",
      mimeType: "image/png",
      content: "mock-image",
    });
    expect(result.description).toContain("Mock");
  });

  it("processes a mock video", async () => {
    const result = await new VideoService().process({
      filename: "sample.mp4",
      mimeType: "video/mp4",
      content: "mock-video",
    });
    expect(result.summary).toContain("Mock");
  });

  it("creates and retrieves a session", async () => {
    const service = new SessionService();
    const created = await service.create({ name: "Test session" });
    expect((await service.getById(created.id)).name).toBe("Test session");
  });

  it("rejects an empty session name", async () => {
    await expect(new SessionService().create({ name: " " })).rejects.toThrow();
  });

  it("submits an asset and processes it", async () => {
    const service = new ProcessingService();
    const asset = await service.submit({
      sessionId: "session-1",
      type: "text",
      filename: "input.txt",
      mimeType: "text/plain",
      content: "hello",
    });

    const result = await service.process(asset.id);
    expect(result.status).toBe("completed");
    expect(result.assetId).toBe(asset.id);
  });

  it("rejects an asset with empty content", async () => {
    await expect(
      new ProcessingService().submit({
        sessionId: "session-1",
        type: "text",
        filename: "input.txt",
        mimeType: "text/plain",
        content: "",
      }),
    ).rejects.toThrow();
  });

  it("stores and retrieves processing results", async () => {
    const service = new ResultService();
    const result = await service.create({
      assetId: "asset-1",
      status: "completed",
      output: { ok: true },
    });

    expect((await service.getById(result.id))?.status).toBe("completed");
  });

  it("queues jobs", () => {
    const manager = new JobManager();
    manager.enqueue("asset-1");
    expect(manager.list()).toHaveLength(1);
  });

  it("handles a multimodal worker job", async () => {
    const result = await new MultimodalWorker().handle({
      id: "job-1",
      assetId: "asset-1",
      type: "processing",
    });

    expect(result.completed).toBe(true);
  });
});
