import type { ElementType } from "react";

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export type Capability = {
  name: string;
  description: string;
  icon: ElementType;
  href?: string;
};

export type BusinessWorkflow = {
  name: string;
  description: string;
  href: string;
};

export type PlusMenuItem = {
  name: string;
  description: string;
  icon: ElementType;
  action: string;
};

export type ActivePage =
  | "home"
  | "plugins"
  | "schedule"
  | "projects"
  | "customise"
  | "library"
  | "plans"
  | "pin-chat"
  | "recents";

export type PageInfo = {
  title: string;
  description: string;
  icon: ElementType;
};