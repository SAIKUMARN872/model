export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

export const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  conversationId: null,
};

export function addMessage(
  state: ChatState,
  message: ChatMessage
): ChatState {
  return {
    ...state,
    messages: [
      ...state.messages,
      message,
    ],
    error: null,
  };
}

export function setMessages(
  state: ChatState,
  messages: ChatMessage[]
): ChatState {
  return {
    ...state,
    messages: [...messages],
  };
}

export function setLoading(
  state: ChatState,
  isLoading: boolean
): ChatState {
  return {
    ...state,
    isLoading,
  };
}

export function setError(
  state: ChatState,
  error: string | null
): ChatState {
  return {
    ...state,
    error,
    isLoading: false,
  };
}

export function setConversationId(
  state: ChatState,
  conversationId: string | null
): ChatState {
  return {
    ...state,
    conversationId,
  };
}

export function clearChat(
  state: ChatState
): ChatState {
  return {
    ...initialState,
  };
}