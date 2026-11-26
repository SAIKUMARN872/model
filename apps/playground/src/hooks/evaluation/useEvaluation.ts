"use client";

import { useCallback, useState } from "react";

export default function useEvaluation() {
  const [evaluations, setEvaluations] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const createEvaluation =
    useCallback(async (evaluationData) => {
      setLoading(true);
      setError(null);

      try {
        const newEvaluation = {
          id: Date.now().toString(),
          ...evaluationData,
          createdAt:
            new Date().toISOString(),
        };

        setEvaluations((previous) => [
          ...previous,
          newEvaluation,
        ]);

        return newEvaluation;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to create evaluation.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  const updateEvaluation =
    useCallback(
      async (id, updates) => {
        setLoading(true);
        setError(null);

        try {
          let updatedEvaluation = null;

          setEvaluations((previous) =>
            previous.map((evaluation) => {
              if (evaluation.id === id) {
                updatedEvaluation = {
                  ...evaluation,
                  ...updates,
                };

                return updatedEvaluation;
              }

              return evaluation;
            })
          );

          return updatedEvaluation;
        } catch (err) {
          const message =
            err?.message ||
            "Failed to update evaluation.";

          setError(message);
          throw err;
        } finally {
          setLoading(false);
        }
      },
      []
    );

  const deleteEvaluation =
    useCallback(async (id) => {
      setLoading(true);
      setError(null);

      try {
        setEvaluations((previous) =>
          previous.filter(
            (evaluation) =>
              evaluation.id !== id
          )
        );
      } catch (err) {
        const message =
          err?.message ||
          "Failed to delete evaluation.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  const getEvaluation =
    useCallback(
      (id) => {
        return evaluations.find(
          (evaluation) =>
            evaluation.id === id
        );
      },
      [evaluations]
    );

  const calculateScore =
    useCallback((evaluation) => {
      if (!evaluation) {
        return 0;
      }

      const scores = [
        Number(evaluation.accuracy) || 0,
        Number(evaluation.quality) || 0,
        Number(evaluation.relevance) || 0,
        Number(evaluation.performance) || 0,
      ];

      const validScores =
        scores.filter(
          (score) => score > 0
        );

      if (validScores.length === 0) {
        return 0;
      }

      const total = validScores.reduce(
        (sum, score) => sum + score,
        0
      );

      return Number(
        (
          total / validScores.length
        ).toFixed(2)
      );
    }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    evaluations,
    loading,
    error,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getEvaluation,
    calculateScore,
    clearError,
  };
}