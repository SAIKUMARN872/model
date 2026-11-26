import { useCallback, useState } from "react";

export interface AnalyticsState {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
}

export interface AnalyticsRequestData {
  success?: boolean;
  tokens?: number | string;
  cost?: number | string;
  latency?: number | string;
}

const initialAnalytics: AnalyticsState = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokens: 0,
  totalCost: 0,
  averageLatency: 0,
};

export default function useAnalytics() {
  const [analytics, setAnalytics] =
    useState<AnalyticsState>(initialAnalytics);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recordRequest = useCallback(
    (data: AnalyticsRequestData = {}): void => {
      setAnalytics((previous) => {
        const totalRequests = previous.totalRequests + 1;

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

        const latency = Number(data.latency) || 0;

        const averageLatency =
          totalRequests > 0
            ? (
                previous.averageLatency *
                  previous.totalRequests +
                latency
              ) / totalRequests
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
    async (
      data: Partial<AnalyticsState> | null = null
    ): Promise<Partial<AnalyticsState> | AnalyticsState> => {
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
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load analytics.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [analytics]
  );

  const resetAnalytics = useCallback((): void => {
    setAnalytics({ ...initialAnalytics });
    setError(null);
  }, []);

  const clearError = useCallback((): void => {
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