import type { RetrievedDocument } from "./retrieval";

export interface ContextItem {
  id: string;
  documentId: string;
  title: string;
  content: string;
  score: number;
  citation: string;
}

export interface ContextAssembly {
  context: string;
  items: ContextItem[];
}

export function compressContext(
  documents: RetrievedDocument[],
  maxCharacters = 6000
): RetrievedDocument[] {
  const result: RetrievedDocument[] = [];
  let totalCharacters = 0;

  for (const document of documents) {
    if (totalCharacters >= maxCharacters) {
      break;
    }

    const remaining = maxCharacters - totalCharacters;

    const content =
      document.content.length > remaining
        ? document.content.slice(0, remaining)
        : document.content;

    result.push({
      ...document,
      content,
    });

    totalCharacters += content.length;
  }

  return result;
}

export function assembleContext(
  documents: RetrievedDocument[]
): ContextAssembly {
  const items: ContextItem[] = documents.map(
    (document, index) => ({
      id: document.id,
      documentId: document.documentId,
      title: document.title,
      content: document.content,
      score: document.score,
      citation: `[${index + 1}] ${document.title}`,
    })
  );

  const context = items
    .map(
      (item) =>
        `${item.citation}\n${item.content}`
    )
    .join("\n\n");

  return {
    context,
    items,
  };
}