"use client";

import { useCallback, useState } from "react";

export default function useModels() {
  const [models, setModels] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const createModel = useCallback(
    async (modelData) => {
      setLoading(true);
      setError(null);

      try {
        const newModel = {
          id: Date.now().toString(),
          ...modelData,
          createdAt:
            new Date().toISOString(),
        };

        setModels((previous) => [
          ...previous,
          newModel,
        ]);

        return newModel;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to create model.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateModel = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);

      try {
        let updatedModel = null;

        setModels((previous) =>
          previous.map((model) => {
            if (model.id === id) {
              updatedModel = {
                ...model,
                ...updates,
              };

              return updatedModel;
            }

            return model;
          })
        );

        return updatedModel;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to update model.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteModel = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        setModels((previous) =>
          previous.filter(
            (model) =>
              model.id !== id
          )
        );
      } catch (err) {
        const message =
          err?.message ||
          "Failed to delete model.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getModel = useCallback(
    (id) => {
      return models.find(
        (model) =>
          model.id === id
      );
    },
    [models]
  );

  const selectModel = useCallback(
    (id) => {
      const model = models.find(
        (item) =>
          item.id === id
      );

      return model || null;
    },
    [models]
  );

  const clearModels = useCallback(() => {
    setModels([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    models,
    loading,
    error,
    createModel,
    updateModel,
    deleteModel,
    getModel,
    selectModel,
    clearModels,
    clearError,
  };
}