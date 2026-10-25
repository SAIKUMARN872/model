import type { ElementType } from "react";

export type Tab =
  | "bases"
  | "documents"
  | "search"
  | "rag"
  | "web"
  | "enterprise"
  | "security"
  | "management";

export type SourceType =
  | "PDF"
  | "DOCX"
  | "TXT"
  | "CSV"
  | "Image"
  | "Audio"
  | "Video"
  | "Web"
  | "URL"
  | "Email"
  | "Database"
  | "API"
  | "Cloud";

export type KnowledgeDocument = {
  id: number;
  name: string;
  source: SourceType;
  collection: string;
  chunks: number;
  status: "Indexed" | "Processing" | "Error";
  updated: string;
  size: string;
};

export type Collection = {
  id: number;
  name: string;
  description: string;
  documents: number;
  chunks: string;
  type: "Private" | "Shared";
};

export type SearchResult = {
  id: number;
  title: string;
  collection: string;
  score: number;
  content: string;
};

export type SourceOption = {
  type: SourceType;
  label: string;
  icon: ElementType;
};
