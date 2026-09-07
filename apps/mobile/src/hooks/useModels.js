import { useCallback, useState } from "react";

export function useModels() {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadModels = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const defaultModels = [
          {
            id: "default",
            name: "Default Model",
            provider: "local",
            enabled: true,
          },
        ];

        setModels(defaultModels);

        return defaultModels;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load models.";

        setError(message);

        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getModel = useCallback(
    (id) => {
      return models.find(
        (model) => model.id === id
      );
    },
    [models]
  );

  const clearModels = useCallback(() => {
    setModels([]);
    setError(null);
  }, []);

  return {
    models,
    isLoading,
    error,
    loadModels,
    getModel,
    clearModels,
  };
}

export default useModels;