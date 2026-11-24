"use client";

import { useCallback, useState } from "react";
import MainChatComposer from "../app/home/components/MainChatComposer";
import type {
  Chat,
  ChatMessage,
} from "../app/home/chat-types";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createChat(): Chat {
  return {
    id: createId(),
    title: "New chat",
    messages: [],
    archived: false,
    pinned: false,
    updatedAt: Date.now(),
  };
}

export default function StandaloneChatComposer() {
  const [chat, setChat] = useState<Chat>(() => createChat());
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    (content: string) => {
      const text = content.trim();

      if (!text || isLoading) return;

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: text,
      };

      setChat((current) => ({
        ...current,
        title:
          current.messages.length === 0
            ? text.slice(0, 40)
            : current.title,
        messages: [...current.messages, userMessage],
        updatedAt: Date.now(),
      }));

      setIsLoading(true);

      // Placeholder response only; connect the real AI API later.
      window.setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content:
            "Your message has been received. Connect the ModelNow AI API to generate a real response.",
        };

        setChat((current) => ({
          ...current,
          messages: [...current.messages, assistantMessage],
          updatedAt: Date.now(),
        }));

        setIsLoading(false);
      }, 700);
    },
    [isLoading],
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      const updatedContent = content.trim();

      if (!updatedContent) return;

      setChat((current) => {
        const messageExists = current.messages.some(
          (message) =>
            message.id === messageId && message.role === "user",
        );

        if (!messageExists) return current;

        const messages = current.messages.map((message) =>
          message.id === messageId && message.role === "user"
            ? { ...message, content: updatedContent }
            : message,
        );

        const firstUserMessage = messages.find(
          (message) => message.role === "user",
        );

        return {
          ...current,
          title:
            firstUserMessage?.id === messageId
              ? updatedContent.slice(0, 40)
              : current.title,
          messages,
          updatedAt: Date.now(),
        };
      });
    },
    [],
  );

  const newChat = useCallback(() => {
    setChat(createChat());
    setIsLoading(false);
  }, []);

  return (
    <MainChatComposer
      key={chat.id}
      chat={chat}
      onSendMessage={sendMessage}
      onEditMessage={editMessage}
      isLoading={isLoading}
      onNewChat={newChat}
    />
  );
}