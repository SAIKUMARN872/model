
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  archived: boolean;
  pinned: boolean;
  updatedAt: number;
};

export type ActivePage =
  | "home"
  | "new-chat"
  | "plugins"
  | "schedule"
  | "projects"
  | "customize"
  | "library"
  | "plans"
  | "pinned"
  | "recents"
  | "profile";
