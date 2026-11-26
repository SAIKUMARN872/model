import { useCallback, useState } from "react";

export interface PlaygroundOptions {
  input?: string;
  model?: string;
}

export interface PlaygroundRunResponse {
  model: string;
  content: string;
  createdAt: string;
}

export default function usePlayground() {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const [selectedModel, setSelectedModel] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const run = useCallback(
    async (
      options: PlaygroundOptions = {}
    ): Promise<PlaygroundRunResponse> => {
      setLoading(true);
      setError(null);

      try {
        const prompt = options.input ?? input;
        const model = options.model ?? selectedModel;

        if (!prompt.trim()) {
          throw new Error("Input is required.");
        }

        // Replace this with the actual API call
        // when the backend is connected.
        const response: PlaygroundRunResponse = {
          model,
          content: `Playground response for: ${prompt}`,
          createdAt: new Date().toISOString(),
        };

        setOutput(response.content);

        return response;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to run playground.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [input, selectedModel]
  );

  const clear = useCallback((): void => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    input,
    setInput,
    output,
    selectedModel,
    setSelectedModel,
    loading,
    error,
    run,
    clear,
    clearError,
  };
}