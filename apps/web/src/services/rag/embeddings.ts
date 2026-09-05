export interface Embedding {
  id: string;
  vector: number[];
}

export async function createEmbedding(
  text: string
): Promise<Embedding> {
  return {
    id: crypto.randomUUID(),
    vector: Array.from(text).map((c) => c.charCodeAt(0) / 255),
  };
}