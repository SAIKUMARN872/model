export type DocumentType =
  | "text"
  | "pdf"
  | "image"
  | "unknown";

export interface ClassificationResult {
  type: DocumentType;
  mimeType: string;
  confidence: number;
  extension: string;
}

const MIME_TYPES: Record<string, { type: DocumentType; extension: string }> = {
  "text/plain": { type: "text", extension: ".txt" },
  "text/markdown": { type: "text", extension: ".md" },
  "text/html": { type: "text", extension: ".html" },
  "application/pdf": { type: "pdf", extension: ".pdf" },
  "image/png": { type: "image", extension: ".png" },
  "image/jpeg": { type: "image", extension: ".jpg" },
  "image/webp": { type: "image", extension: ".webp" },
  "image/gif": { type: "image", extension: ".gif" },
};

export function classifyDocument(
  input: string | Uint8Array,
  filename?: string,
  mimeType?: string,
): ClassificationResult {
  const normalizedMime = (mimeType ?? "").split(";")[0].trim().toLowerCase();
  const extension = filename?.match(/\.[^.\\/]+$/)?.[0].toLowerCase() ?? "";

  if (normalizedMime && MIME_TYPES[normalizedMime]) {
    const match = MIME_TYPES[normalizedMime];
    return {
      type: match.type,
      mimeType: normalizedMime,
      confidence: 1,
      extension: extension || match.extension,
    };
  }

  const extensionTypes: Record<string, { type: DocumentType; mimeType: string }> = {
    ".txt": { type: "text", mimeType: "text/plain" },
    ".md": { type: "text", mimeType: "text/markdown" },
    ".html": { type: "text", mimeType: "text/html" },
    ".pdf": { type: "pdf", mimeType: "application/pdf" },
    ".png": { type: "image", mimeType: "image/png" },
    ".jpg": { type: "image", mimeType: "image/jpeg" },
    ".jpeg": { type: "image", mimeType: "image/jpeg" },
    ".webp": { type: "image", mimeType: "image/webp" },
    ".gif": { type: "image", mimeType: "image/gif" },
  };

  if (extension && extensionTypes[extension]) {
    const match = extensionTypes[extension];
    return {
      type: match.type,
      mimeType: match.mimeType,
      confidence: 0.85,
      extension,
    };
  }

  if (typeof input === "string") {
    return {
      type: "text",
      mimeType: "text/plain",
      confidence: 0.7,
      extension: extension || ".txt",
    };
  }

  const bytes = input;
  const isPdf =
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d;

  if (isPdf) {
    return {
      type: "pdf",
      mimeType: "application/pdf",
      confidence: 0.99,
      extension: extension || ".pdf",
    };
  }

  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  if (isPng) {
    return {
      type: "image",
      mimeType: "image/png",
      confidence: 0.99,
      extension: extension || ".png",
    };
  }

  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;

  if (isJpeg) {
    return {
      type: "image",
      mimeType: "image/jpeg",
      confidence: 0.99,
      extension: extension || ".jpg",
    };
  }

  return {
    type: "unknown",
    mimeType: normalizedMime || "application/octet-stream",
    confidence: 0,
    extension,
  };
}
