import { useCallback, useState } from "react";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (content) => {
      if (!content || !content.trim()) {
        return;
      }

      setError(null);
      setIsLoading(true);

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
      ]);

      try {
        const assistantMessage = {
          id:
            Date.now().toString() +
            "-assistant",
          role: "assistant",
          content:
            "Your message was received successfully.",
          createdAt:
            new Date().toISOString(),
        };

        setMessages((previous) => [
          ...previous,
          assistantMessage,
        ]);

        return assistantMessage;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}

export default useChat;