"use client";

import {
  useCallback,
  useState,
} from "react";

export default function useAgents() {
  const [agents, setAgents] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const createAgent = useCallback(
    async (agentData) => {
      setLoading(true);
      setError(null);

      try {
        const newAgent = {
          id: Date.now().toString(),
          ...agentData,
          createdAt:
            new Date().toISOString(),
        };

        setAgents((previous) => [
          ...previous,
          newAgent,
        ]);

        return newAgent;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to create agent.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAgent = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);

      try {
        let updatedAgent = null;

        setAgents((previous) =>
          previous.map((agent) => {
            if (agent.id === id) {
              updatedAgent = {
                ...agent,
                ...updates,
              };

              return updatedAgent;
            }

            return agent;
          })
        );

        return updatedAgent;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to update agent.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteAgent = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        setAgents((previous) =>
          previous.filter(
            (agent) =>
              agent.id !== id
          )
        );
      } catch (err) {
        const message =
          err?.message ||
          "Failed to delete agent.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getAgent = useCallback(
    (id) => {
      return agents.find(
        (agent) =>
          agent.id === id
      );
    },
    [agents]
  );

  const clearError = useCallback(
    () => {
      setError(null);
    },
    []
  );

  return {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    clearError,
  };
}