"use client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api";

export async function streamResponse(
  endpoint,
  payload = {},
  options = {}
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Streaming request failed with status ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Streaming is not supported by this response."
    );
  }

  return response.body;
}

export async function streamAgent(
  agentId,
  input,
  options = {}
) {
  if (!agentId) {
    throw new Error(
      "Agent ID is required."
    );
  }

  if (!input) {
    throw new Error(
      "Agent input is required."
    );
  }

  return streamResponse(
    `/agents/${agentId}/stream`,
    {
      input,
      ...options.payload,
    },
    options
  );
}

export async function streamPrompt(
  promptId,
  input,
  options = {}
) {
  if (!promptId) {
    throw new Error(
      "Prompt ID is required."
    );
  }

  if (!input) {
    throw new Error(
      "Prompt input is required."
    );
  }

  return streamResponse(
    `/prompts/${promptId}/stream`,
    {
      input,
      ...options.payload,
    },
    options
  );
}

export async function streamChat(
  messages,
  options = {}
) {
  if (
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    throw new Error(
      "Chat messages are required."
    );
  }

  return streamResponse(
    "/chat/stream",
    {
      messages,
      model: options.model,
      ...options.payload,
    },
    options
  );
}

export async function readStream(
  stream,
  onChunk,
  options = {}
) {
  if (!stream) {
    throw new Error(
      "Readable stream is required."
    );
  }

  const reader =
    stream.getReader();

  const decoder =
    new TextDecoder();

  let result = "";

  try {
    while (true) {
      const { value, done } =
        await reader.read();

      if (done) {
        break;
      }

      const chunk =
        decoder.decode(value, {
          stream: true,
        });

      result += chunk;

      if (onChunk) {
        onChunk(chunk);
      }

      if (
        options.signal?.aborted
      ) {
        await reader.cancel();
        break;
      }
    }

    const finalChunk =
      decoder.decode();

    if (finalChunk) {
      result += finalChunk;

      if (onChunk) {
        onChunk(finalChunk);
      }
    }

    return result;
  } finally {
    reader.releaseLock();
  }
}

export default {
  streamResponse,
  streamAgent,
  streamPrompt,
  streamChat,
  readStream,
};