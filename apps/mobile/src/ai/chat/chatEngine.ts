export interface ChatMessage {
  role: "system" | "user" | "assistant";

  content: string;
}

export interface ChatRequest {
  conversationId: string;

  userId: string;

  messages: ChatMessage[];

  model?: string;

  temperature?: number;

  maxTokens?: number;

  stream?: boolean;
}

export interface ChatUsage {
  promptTokens: number;

  completionTokens: number;

  totalTokens: number;
}

export interface ChatResponse {
  id: string;

  model: string;

  message: ChatMessage;

  usage: ChatUsage;

  createdAt: string;
}

export class ChatEngine {
  private initialized = false;

  public initialize(): void {
    this.initialized = true;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public async generate(
    request: ChatRequest
  ): Promise<ChatResponse> {
    if (!this.initialized) {
      throw new Error("ChatEngine is not initialized.");
    }

    if (request.messages.length === 0) {
      throw new Error("No messages supplied.");
    }

    const lastMessage =
      request.messages[request.messages.length - 1];

    const response: ChatResponse = {
      id: this.generateId(),

      model: request.model ?? "default",

      message: {
        role: "assistant",
        content: `Echo: ${lastMessage.content}`,
      },

      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },

      createdAt: new Date().toISOString(),
    };

    return response;
  }

  public async stream(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await this.generate(request);

    const words = response.message.content.split(" ");

    for (const word of words) {
      onChunk(word + " ");

      await this.delay(20);
    }
  }

  public clear(): void {}

  public shutdown(): void {
    this.initialized = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 10)
    );
  }
}

const chatEngine = new ChatEngine();

chatEngine.initialize();

export default chatEngine;