export type WebhookStatus = "active" | "disabled";

export interface Webhook {
  id: string;
  ownerId: string;
  url: string;
  events: string[];
  secret: string;
  status: WebhookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebhookInput {
  ownerId: string;
  url: string;
  events: string[];
}

export interface UpdateWebhookInput {
  url?: string;
  events?: string[];
  status?: WebhookStatus;
}

function validateHttpUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("url must be a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("url must use HTTP or HTTPS.");
  }
}

export function validateCreateWebhookInput(input: CreateWebhookInput): void {
  if (!input.ownerId.trim()) throw new Error("ownerId is required.");
  validateHttpUrl(input.url);
  if (!Array.isArray(input.events) || input.events.length === 0) {
    throw new Error("At least one webhook event is required.");
  }
  if (input.events.some((event) => typeof event !== "string" || !event.trim())) {
    throw new Error("Webhook events must be non-empty strings.");
  }
}

export function validateUpdateWebhookInput(input: UpdateWebhookInput): void {
  if (input.url !== undefined) validateHttpUrl(input.url);
  if (input.events !== undefined) {
    if (!Array.isArray(input.events) || input.events.length === 0 ||
      input.events.some((event) => typeof event !== "string" || !event.trim())) {
      throw new Error("Webhook events must contain non-empty strings.");
    }
  }
  if (input.status !== undefined && !["active", "disabled"].includes(input.status)) {
    throw new Error("Invalid webhook status.");
  }
}
