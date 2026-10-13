import { createHmac, randomBytes, randomUUID } from "node:crypto";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  Webhook,
} from "./webhook-schema.js";
import { validateCreateWebhookInput, validateUpdateWebhookInput } from "./webhook-schema.js";
import { WebhookRepository } from "./webhook-repository.js";

export class WebhookService {
  constructor(private readonly repository = new WebhookRepository()) {}

  create(input: CreateWebhookInput): Webhook {
    validateCreateWebhookInput(input);
    const now = new Date();

    return this.repository.save({
      id: randomUUID(),
      ownerId: input.ownerId.trim(),
      url: new URL(input.url).toString(),
      events: [...new Set(input.events.map((event) => event.trim()))],
      secret: randomBytes(32).toString("hex"),
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  }

  get(id: string, ownerId: string): Webhook | undefined {
    const webhook = this.repository.getById(id);
    if (webhook && webhook.ownerId !== ownerId) {
      throw new Error("Webhook does not belong to this owner.");
    }
    return webhook;
  }

  list(ownerId: string): Webhook[] {
    return this.repository.listByOwner(ownerId);
  }

  update(id: string, ownerId: string, input: UpdateWebhookInput): Webhook {
    validateUpdateWebhookInput(input);
    const webhook = this.get(id, ownerId);
    if (!webhook) throw new Error("Webhook not found.");

    return this.repository.save({
      ...webhook,
      ...(input.url !== undefined ? { url: new URL(input.url).toString() } : {}),
      ...(input.events !== undefined
        ? { events: [...new Set(input.events.map((event) => event.trim()))] }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date(),
    });
  }

  signPayload(id: string, ownerId: string, payload: string): string {
    const webhook = this.get(id, ownerId);
    if (!webhook) throw new Error("Webhook not found.");
    return createHmac("sha256", webhook.secret).update(payload).digest("hex");
  }

  delete(id: string, ownerId: string): boolean {
    const webhook = this.get(id, ownerId);
    if (!webhook) return false;
    return this.repository.delete(id);
  }
}
