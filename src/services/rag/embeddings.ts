export interface Embedding {
  id: string;
  vector: number[];
  text?: string;
  metadata?: Record<string, unknown>;
}

export interface EmbeddingInput {
  id?: string;
  text: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a deterministic local embedding.
 *
 * This is the platform abstraction we will later connect
 * to a real embedding provider without changing the rest
 * of the Knowledge Hub pipeline.
 */
export async function createEmbedding(
  input: string | EmbeddingInput
): Promise<Embedding> {
  const text = typeof input === "string" ? input : input.text;
  const id =
    typeof input === "string"
      ? crypto.randomUUID()
      : input.id ?? crypto.randomUUID();

  const metadata =
    typeof input === "string" ? undefined : input.metadata;

  if (!text.trim()) {
    throw new Error("Text is required to create an embedding");
  }

  const vector = generateLocalVector(text);

  return {
    id,
    vector,
    text,
    metadata,
  };
}

function generateLocalVector(text: string): number[] {
  const dimensions = 128;
  const vector = new Array<number>(dimensions).fill(0);

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    const index = i % dimensions;

    vector[index] +=
      Math.sin(code * 0.017) +
      Math.cos(code * 0.013);
  }

  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0)
  );

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => value / magnitude);
}

/**
 * Creates embeddings for multiple texts.
 */
export async function createEmbeddings(
  inputs: EmbeddingInput[]
): Promise<Embedding[]> {
  return Promise.all(
    inputs.map((input) => createEmbedding(input))
  );
}