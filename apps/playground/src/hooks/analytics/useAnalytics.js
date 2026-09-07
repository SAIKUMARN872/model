"use client";

import { useCallback, useState } from "react";

export default function useAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    averageLatency: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recordRequest = useCallback(
    (data = {}) => {
      setAnalytics((previous) => {
        const totalRequests =
          previous.totalRequests + 1;

        const successfulRequests =
          previous.successfulRequests +
          (data.success === false ? 0 : 1);

        const failedRequests =
          previous.failedRequests +
          (data.success === false ? 1 : 0);

        const totalTokens =
          previous.totalTokens +
          (Number(data.tokens) || 0);

        const totalCost =
          previous.totalCost +
          (Number(data.cost) || 0);

        const latency =
          Number(data.latency) || 0;

        const averageLatency =
          totalRequests > 0
            ? (
                (previous.averageLatency *
                  previous.totalRequests +
                  latency) /
                totalRequests
              )
            : 0;

        return {
          totalRequests,
          successfulRequests,
          failedRequests,
          totalTokens,
          totalCost,
          averageLatency,
        };
      });
    },
    []
  );

  const loadAnalytics = useCallback(
    async (data = null) => {
      setLoading(true);
      setError(null);

      try {
        if (data) {
          setAnalytics((previous) => ({
            ...previous,
            ...data,
          }));
        }

        return data || analytics;
      } catch (err) {
        const message =
          err?.message ||
          "Failed to load analytics.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [analytics]
  );

  const resetAnalytics = useCallback(() => {
    setAnalytics({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageLatency: 0,
    });

    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    analytics,
    loading,
    error,
    recordRequest,
    loadAnalytics,
    resetAnalytics,
    clearError,
  };
}