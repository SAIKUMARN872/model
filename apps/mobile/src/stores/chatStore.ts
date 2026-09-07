export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  conversationId: null,
  isLoading: false,
  error: null,
};

let chatState: ChatState = {
  ...initialState,
};

export function getChatState(): ChatState {
  return {
    ...chatState,
    messages: [...chatState.messages],
  };
}

export function addMessage(
  message: ChatMessage
): ChatState {
  chatState = {
    ...chatState,
    messages: [
      ...chatState.messages,
      message,
    ],
    error: null,
  };

  return getChatState();
}

export function setMessages(
  messages: ChatMessage[]
): ChatState {
  chatState = {
    ...chatState,
    messages: [...messages],
  };

  return getChatState();
}

export function setConversationId(
  conversationId: string | null
): ChatState {
  chatState = {
    ...chatState,
    conversationId,
  };

  return getChatState();
}

export function setLoading(
  isLoading: boolean
): ChatState {
  chatState = {
    ...chatState,
    isLoading,
  };

  return getChatState();
}

export function setError(
  error: string | null
): ChatState {
  chatState = {
    ...chatState,
    error,
    isLoading: false,
  };

  return getChatState();
}

export function clearChat(): ChatState {
  chatState = {
    ...initialState,
  };

  return getChatState();
}

export function removeMessage(
  messageId: string
): ChatState {
  chatState = {
    ...chatState,
    messages:
      chatState.messages.filter(
        (message) =>
          message.id !== messageId
      ),
  };

  return getChatState();
}

export default {
  getChatState,
  addMessage,
  setMessages,
  setConversationId,
  setLoading,
  setError,
  clearChat,
  removeMessage,
};