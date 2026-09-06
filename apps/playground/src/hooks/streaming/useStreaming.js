"use client";

import { useCallback, useState } from "react";

export default function useStreaming() {
  const [data, setData] = useState("");
  const [isStreaming, setIsStreaming] =
    useState(false);
  const [error, setError] = useState(null);

  const startStreaming = useCallback(
    async (streamSource) => {
      setData("");
      setError(null);
      setIsStreaming(true);

      try {
        if (!streamSource) {
          throw new Error(
            "Stream source is required."
          );
        }

        if (
          typeof streamSource === "string"
        ) {
          setData(streamSource);
          return streamSource;
        }

        if (
          typeof streamSource[Symbol.asyncIterator] ===
          "function"
        ) {
          let result = "";

          for await (
            const chunk of streamSource
          ) {
            const text =
              typeof chunk === "string"
                ? chunk
                : chunk?.content ||
                  chunk?.text ||
                  "";

            result += text;
            setData(result);
          }

          return result;
        }

        if (
          typeof streamSource[Symbol.iterator] ===
          "function"
        ) {
          let result = "";

          for (const chunk of streamSource) {
            const text =
              typeof chunk === "string"
                ? chunk
                : chunk?.content ||
                  chunk?.text ||
                  "";

            result += text;
            setData(result);
          }

          return result;
        }

        throw new Error(
          "Invalid stream source."
        );
      } catch (err) {
        const message =
          err?.message ||
          "Streaming failed.";

        setError(message);
        throw err;
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const appendData = useCallback(
    (chunk) => {
      const text =
        typeof chunk === "string"
          ? chunk
          : chunk?.content ||
            chunk?.text ||
            "";

      setData((previous) =>
        previous + text
      );
    },
    []
  );

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
  }, []);

  const clearData = useCallback(() => {
    setData("");
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    isStreaming,
    error,
    startStreaming,
    appendData,
    stopStreaming,
    clearData,
    clearError,
  };
}