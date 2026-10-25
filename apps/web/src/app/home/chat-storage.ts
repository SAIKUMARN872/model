
import type { Chat, ChatMessage } from "./chat-types";

export const CHAT_STORAGE_KEY = "modelnow-chat-v5";

const MAX_CHATS = 500;
const MAX_MESSAGES_PER_CHAT = 5000;
const MAX_TITLE_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 100000;

export function createChatId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createNewChat(): Chat {
  return {
    id: createChatId(),
    title: "New chat",
    messages: [],
    archived: false,
    pinned: false,
    updatedAt: Date.now(),
  };
}

export function getChatTitle(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) return "New chat";

  return normalized.length > MAX_TITLE_LENGTH
    ? `${normalized.slice(0, MAX_TITLE_LENGTH - 3)}...`
    : normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.id !== "string" ||
    (value.role !== "user" && value.role !== "assistant") ||
    typeof value.content !== "string"
  ) {
    return null;
  }

  return {
    id: value.id.slice(0, 200),
    role: value.role,
    content: value.content.slice(0, MAX_MESSAGE_LENGTH),
  };
}

function normalizeChat(value: unknown): Chat | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    !Array.isArray(value.messages)
  ) {
    return null;
  }

  const messages = value.messages
    .slice(0, MAX_MESSAGES_PER_CHAT)
    .map(normalizeMessage)
    .filter((message): message is ChatMessage => message !== null);

  const updatedAt =
    typeof value.updatedAt === "number" &&
    Number.isFinite(value.updatedAt) &&
    value.updatedAt >= 0
      ? value.updatedAt
      : Date.now();

  return {
    id: value.id.slice(0, 200),
    title: getChatTitle(value.title),
    messages,
    archived: value.archived === true,
    pinned: value.pinned === true,
    updatedAt,
  };
}

export function loadChats(): Chat[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CHAT_STORAGE_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    const seenIds = new Set<string>();
    const chats: Chat[] = [];

    for (const item of parsed.slice(0, MAX_CHATS)) {
      const chat = normalizeChat(item);

      if (!chat || !chat.id || seenIds.has(chat.id)) continue;

      seenIds.add(chat.id);
      chats.push(chat);
    }

    return chats;
  } catch {
    // Storage can be unavailable or contain invalid JSON.
    // Keep the application usable instead of crashing.
    return [];
  }
}

export function saveChats(chats: Chat[]): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(chats.slice(0, MAX_CHATS)),
    );

    return true;
  } catch {
    // For example, browser storage may be full or disabled.
    return false;
  }
}
