export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage;
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  if (!request.message.trim()) {
    throw new Error(
      "Chat message is required."
    );
  }

  const userMessage: ChatMessage = {
    id: generateId(),
    role: "user",
    content: request.message,
    createdAt:
      new Date().toISOString(),
  };

  const assistantMessage: ChatMessage = {
    id: generateId(),
    role: "assistant",
    content:
      "Your message was received successfully.",
    createdAt:
      new Date().toISOString(),
  };

  return {
    conversationId:
      request.conversationId ??
      generateId(),

    message: assistantMessage,
  };
}

export function createChatMessage(
  role: ChatMessage["role"],
  content: string
): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    createdAt:
      new Date().toISOString(),
  };
}

function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 10)
  );
}