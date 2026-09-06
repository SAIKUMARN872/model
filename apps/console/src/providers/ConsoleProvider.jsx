import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Console Context
 */
const ConsoleContext =
  createContext(null);

/**
 * Console Provider
 *
 * Provides global state and common
 * actions for the AI Console.
 */
export const ConsoleProvider = ({
  children,
}) => {
  /**
   * Current workspace.
   */
  const [
    workspace,
    setWorkspaceState,
  ] = useState(null);

  /**
   * Current organization.
   */
  const [
    organization,
    setOrganizationState,
  ] = useState(null);

  /**
   * Selected model.
   */
  const [
    selectedModel,
    setSelectedModelState,
  ] = useState(null);

  /**
   * Current environment.
   */
  const [
    environment,
    setEnvironmentState,
  ] = useState("production");

  /**
   * Global loading state.
   */
  const [
    loading,
    setLoading,
  ] = useState(false);

  /**
   * Global error state.
   */
  const [
    error,
    setError,
  ] = useState(null);

  /**
   * Last refresh timestamp.
   */
  const [
    lastRefreshedAt,
    setLastRefreshedAt,
  ] = useState(null);

  /**
   * Whether the console is ready.
   */
  const [
    initialized,
    setInitialized,
  ] = useState(false);

  /**
   * Set workspace.
   */
  const setWorkspace =
    useCallback(
      (value) => {
        setWorkspaceState(
          value
        );
      },
      []
    );

  /**
   * Set organization.
   */
  const setOrganization =
    useCallback(
      (value) => {
        setOrganizationState(
          value
        );
      },
      []
    );

  /**
   * Set selected model.
   */
  const setSelectedModel =
    useCallback(
      (model) => {
        setSelectedModelState(
          model
        );
      },
      []
    );

  /**
   * Set environment.
   */
  const setEnvironment =
    useCallback(
      (value) => {
        setEnvironmentState(
          value
        );
      },
      []
    );

  /**
   * Start global loading.
   */
  const startLoading =
    useCallback(() => {
      setLoading(true);

      setError(null);
    }, []);

  /**
   * Stop global loading.
   */
  const stopLoading =
    useCallback(() => {
      setLoading(false);
    }, []);

  /**
   * Set global error.
   */
  const setConsoleError =
    useCallback(
      (value) => {
        setError(value);

        setLoading(false);
      },
      []
    );

  /**
   * Clear global error.
   */
  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /**
   * Mark console as initialized.
   */
  const initialize =
    useCallback(() => {
      setInitialized(true);

      setLastRefreshedAt(
        new Date().toISOString()
      );
    }, []);

  /**
   * Mark data as refreshed.
   */
  const markRefreshed =
    useCallback(() => {
      setLastRefreshedAt(
        new Date().toISOString()
      );
    }, []);

  /**
   * Reset Console state.
   */
  const resetConsole =
    useCallback(() => {
      setWorkspaceState(
        null
      );

      setOrganizationState(
        null
      );

      setSelectedModelState(
        null
      );

      setEnvironmentState(
        "production"
      );

      setLoading(false);

      setError(null);

      setLastRefreshedAt(
        null
      );

      setInitialized(false);
    }, []);

  /**
   * Context value.
   */
  const value =
    useMemo(
      () => ({
        /**
         * State
         */
        workspace,

        organization,

        selectedModel,

        environment,

        loading,

        error,

        initialized,

        lastRefreshedAt,

        /**
         * Workspace
         */
        setWorkspace,

        /**
         * Organization
         */
        setOrganization,

        /**
         * Model
         */
        setSelectedModel,

        /**
         * Environment
         */
        setEnvironment,

        /**
         * Loading
         */
        startLoading,

        stopLoading,

        /**
         * Error
         */
        setError:
          setConsoleError,

        clearError,

        /**
         * Lifecycle
         */
        initialize,

        markRefreshed,

        /**
         * Reset
         */
        resetConsole,
      }),
      [
        workspace,
        organization,
        selectedModel,
        environment,
        loading,
        error,
        initialized,
        lastRefreshedAt,
        setWorkspace,
        setOrganization,
        setSelectedModel,
        setEnvironment,
        startLoading,
        stopLoading,
        setConsoleError,
        clearError,
        initialize,
        markRefreshed,
        resetConsole,
      ]
    );

  return (
    <ConsoleContext.Provider
      value={value}
    >
      {children}
    </ConsoleContext.Provider>
  );
};

/**
 * useConsole hook.
 *
 * Example:
 *
 * const {
 *   selectedModel,
 *   setSelectedModel,
 *   environment,
 * } = useConsole();
 */
export const useConsole = () => {
  const context =
    useContext(
      ConsoleContext
    );

  if (!context) {
    throw new Error(
      "useConsole must be used inside ConsoleProvider."
    );
  }

  return context;
};

/**
 * Default export.
 */
export default ConsoleProvider;