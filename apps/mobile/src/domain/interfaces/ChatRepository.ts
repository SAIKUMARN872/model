export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export class ChatRepository {
  private conversations: Map<
    string,
    ChatConversation
  > = new Map();

  private messages: Map<
    string,
    ChatMessage[]
  > = new Map();

  public createConversation(
    userId: string,
    title?: string
  ): ChatConversation {
    const conversation: ChatConversation = {
      id: this.generateId(),
      userId,
      title,
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
    };

    this.conversations.set(
      conversation.id,
      conversation
    );

    this.messages.set(
      conversation.id,
      []
    );

    return conversation;
  }

  public getConversation(
    conversationId: string
  ): ChatConversation | undefined {
    return this.conversations.get(
      conversationId
    );
  }

  public getUserConversations(
    userId: string
  ): ChatConversation[] {
    return Array.from(
      this.conversations.values()
    ).filter(
      (conversation) =>
        conversation.userId === userId
    );
  }

  public addMessage(
    message: ChatMessage
  ): ChatMessage {
    if (
      !this.conversations.has(
        message.conversationId
      )
    ) {
      throw new Error(
        "Conversation not found."
      );
    }

    const conversationMessages =
      this.messages.get(
        message.conversationId
      ) ?? [];

    conversationMessages.push(
      message
    );

    this.messages.set(
      message.conversationId,
      conversationMessages
    );

    const conversation =
      this.conversations.get(
        message.conversationId
      );

    if (conversation) {
      conversation.updatedAt =
        new Date().toISOString();

      this.conversations.set(
        conversation.id,
        conversation
      );
    }

    return message;
  }

  public getMessages(
    conversationId: string
  ): ChatMessage[] {
    return [
      ...(this.messages.get(
        conversationId
      ) ?? []),
    ];
  }

  public deleteConversation(
    conversationId: string
  ): boolean {
    const deleted =
      this.conversations.delete(
        conversationId
      );

    this.messages.delete(
      conversationId
    );

    return deleted;
  }

  public clear(): void {
    this.conversations.clear();
    this.messages.clear();
  }

  public conversationCount(): number {
    return this.conversations.size;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const chatRepository =
  new ChatRepository();

export default chatRepository;