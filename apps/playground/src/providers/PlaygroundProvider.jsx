"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const PlaygroundContext =
  createContext(null);

export function PlaygroundProvider({
  children,
}) {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [selectedModel, setSelectedModel] =
    useState("");

  const [selectedTool, setSelectedTool] =
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

        const tool =
          options.tool ??
          selectedTool;

        if (!prompt.trim()) {
          throw new Error(
            "Please enter a prompt."
          );
        }

        const response = {
          id: Date.now().toString(),
          content:
            `Playground response for: ${prompt}`,
          model,
          tool,
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
    [
      input,
      selectedModel,
      selectedTool,
    ]
  );

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      input,
      setInput,
      output,
      setOutput,
      selectedModel,
      setSelectedModel,
      selectedTool,
      setSelectedTool,
      loading,
      error,
      run,
      clear,
      clearError,
    }),
    [
      input,
      output,
      selectedModel,
      selectedTool,
      loading,
      error,
      run,
      clear,
      clearError,
    ]
  );

  return (
    <PlaygroundContext.Provider
      value={value}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlaygroundContext() {
  const context =
    useContext(PlaygroundContext);

  if (!context) {
    throw new Error(
      "usePlaygroundContext must be used inside PlaygroundProvider."
    );
  }

  return context;
}

export default PlaygroundContext;