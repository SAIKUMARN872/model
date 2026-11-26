"use client";

import { useCallback, useState } from "react";

export default function usePrompts() {
  const [prompts, setPrompts] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const createPrompt = useCallback(
    async (promptData) => {
      setLoading(true);
      setError(null);

      try {
        const newPrompt = {
          id: Date.now().toString(),
          ...promptData,
          createdAt:
            new Date().toISOString(),
        };

        setPrompts((previous) => [
          ...previous,
          newPrompt,
        ]);

        return newPrompt;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to create prompt.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePrompt = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);

      try {
        let updatedPrompt = null;

        setPrompts((previous) =>
          previous.map((prompt) => {
            if (prompt.id === id) {
              updatedPrompt = {
                ...prompt,
                ...updates,
              };

              return updatedPrompt;
            }

            return prompt;
          })
        );

        return updatedPrompt;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to update prompt.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deletePrompt = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        setPrompts((previous) =>
          previous.filter(
            (prompt) =>
              prompt.id !== id
          )
        );
      } catch (err) {
        const message =
          err?.message ||
          "Failed to delete prompt.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPrompt = useCallback(
    (id) => {
      return prompts.find(
        (prompt) =>
          prompt.id === id
      );
    },
    [prompts]
  );

  const selectPrompt = useCallback(
    (id) => {
      const prompt = prompts.find(
        (item) =>
          item.id === id
      );

      return prompt || null;
    },
    [prompts]
  );

  const clearPrompts = useCallback(() => {
    setPrompts([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getPrompt,
    selectPrompt,
    clearPrompts,
    clearError,
  };
}