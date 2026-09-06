export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function createMessage(
  role: Message["role"],
  content: string,
  metadata?: Record<string, unknown>
): Message {
  if (!content.trim()) {
    throw new Error(
      "Message content is required."
    );
  }

  return {
    id: generateMessageId(),
    role,
    content,
    timestamp:
      new Date().toISOString(),
    metadata,
  };
}

export function isUserMessage(
  message: Message
): boolean {
  return message.role === "user";
}

export function isAssistantMessage(
  message: Message
): boolean {
  return message.role === "assistant";
}

export function isSystemMessage(
  message: Message
): boolean {
  return message.role === "system";
}

export function generateMessageId(): string {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 10)
  );
}