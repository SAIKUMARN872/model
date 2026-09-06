"use client";

import { useCallback, useState } from "react";

export default function useRag() {
  const [documents, setDocuments] =
    useState([]);

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const addDocument = useCallback(
    async (document) => {
      setLoading(true);
      setError(null);

      try {
        if (!document) {
          throw new Error(
            "Document is required."
          );
        }

        const newDocument = {
          id: Date.now().toString(),
          ...document,
          createdAt:
            new Date().toISOString(),
        };

        setDocuments((previous) => [
          ...previous,
          newDocument,
        ]);

        return newDocument;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to add document.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeDocument =
    useCallback(async (id) => {
      setLoading(true);
      setError(null);

      try {
        setDocuments((previous) =>
          previous.filter(
            (document) =>
              document.id !== id
          )
        );
      } catch (err) {
        const message =
          err?.message ||
          "Failed to remove document.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  const search = useCallback(
    async (query) => {
      setLoading(true);
      setError(null);

      try {
        if (!query?.trim()) {
          setResults([]);
          return [];
        }

        const searchResults =
          documents.filter(
            (document) => {
              const content =
                `${document.name || ""} ${
                  document.content || ""
                }`.toLowerCase();

              return content.includes(
                query.toLowerCase()
              );
            }
          );

        setResults(searchResults);

        return searchResults;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to search documents.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [documents]
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    setResults([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    documents,
    results,
    loading,
    error,
    addDocument,
    removeDocument,
    search,
    clearResults,
    clearDocuments,
    clearError,
  };
}