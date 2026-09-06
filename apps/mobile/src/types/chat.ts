export interface ChatTheme {
  userMessage: {
    background: string;
    text: string;
  };

  assistantMessage: {
    background: string;
    text: string;
  };

  input: {
    background: string;
    text: string;
    border: string;
    placeholder: string;
  };

  button: {
    background: string;
    text: string;
  };
}

export const chatTheme: ChatTheme = {
  userMessage: {
    background: "#2563EB",
    text: "#FFFFFF",
  },

  assistantMessage: {
    background: "#F1F5F9",
    text: "#0F172A",
  },

  input: {
    background: "#FFFFFF",
    text: "#0F172A",
    border: "#E2E8F0",
    placeholder: "#94A3B8",
  },

  button: {
    background: "#2563EB",
    text: "#FFFFFF",
  },
};

export function getChatTheme(): ChatTheme {
  return {
    ...chatTheme,
  };
}

export default chatTheme;