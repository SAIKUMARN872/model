"use client";

import { useCallback, useState } from "react";

export default function usePlayground() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedModel, setSelectedModel] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const run = useCallback(
    async (options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const prompt =
          options.input ?? input;

        const model =
          options.model ??
          selectedModel;

        if (!prompt.trim()) {
          throw new Error(
            "Input is required."
          );
        }

        // Replace this with your API call
        // when the backend is connected.
        const response = {
          model,
          content:
            `Playground response for: ${prompt}`,
          createdAt:
            new Date().toISOString(),
        };

        setOutput(response.content);

        return response;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to run playground.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [input, selectedModel]
  );

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const clearError = useCallback(() => {
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