"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import playgroundApi from "../services/playgroundApi";

import {
  normalizeApiError,
} from "../errors/ApiError";

/**
 * Enterprise Playground Hook
 *
 * Responsibilities:
 * - Model selection
 * - Prompt execution
 * - Streaming responses
 * - Conversation history
 * - Generation parameters
 * - Request cancellation
 * - Token usage
 * - Latency tracking
 * - Request status
 * - Error handling
 * - Reset / clear playground
 */

/**
 * Default generation parameters.
 */
const DEFAULT_PARAMETERS = {
  temperature: 0.7,
  maxTokens: 1024,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stopSequences: [],
};

/**
 * Default playground state.
 */
const DEFAULT_STATE = {
  model: null,
  prompt: "",
  response: "",
  messages: [],
  usage: null,
  latency: null,
  requestId: null,
};

/**
 * Normalize API response.
 */
const normalizeResponse = (
  response
) => {
  if (!response) {
    return {};
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  return response;
};

/**
 * Extract response text from
 * different backend response formats.
 */
const extractResponseText = (
  response
) => {
  const data =
    normalizeResponse(response);

  return (
    data.text ||
    data.content ||
    data.response ||
    data.output ||
    data.message?.content ||
    ""
  );
};

/**
 * Extract usage information.
 */
const extractUsage = (
  response
) => {
  const data =
    normalizeResponse(response);

  return (
    data.usage ||
    data.tokenUsage ||
    null
  );
};

/**
 * Main usePlayground hook.
 */
const usePlayground = (
  options = {}
) => {
  const {
    enabled = true,
    initialModel = null,
    initialPrompt = "",
    initialParameters = {},
    maxHistory = 50,
  } = options;

  /**
   * Playground state.
   */
  const [
    state,
    setState,
  ] = useState({
    ...DEFAULT_STATE,
    model: initialModel,
    prompt: initialPrompt,
  });

  /**
   * Generation parameters.
   */
  const [
    parameters,
    setParameters,
  ] = useState({
    ...DEFAULT_PARAMETERS,
    ...initialParameters,
  });

  /**
   * Request state.
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isStreaming,
    setIsStreaming,
  ] = useState(false);

  const [
    isCancelling,
    setIsCancelling,
  ] = useState(false);

  /**
   * Errors.
   */
  const [
    error,
    setError,
  ] = useState(null);

  /**
   * Request metadata.
   */
  const [
    lastRequestAt,
    setLastRequestAt,
  ] = useState(null);

  const [
    lastCompletedAt,
    setLastCompletedAt,
  ] = useState(null);

  /**
   * Abort controller for
   * cancelling active requests.
   */
  const abortControllerRef =
    useRef(null);

  /**
   * Request start timestamp.
   */
  const requestStartRef =
    useRef(null);

  /**
   * Track mounted state.
   */
  const mountedRef =
    useRef(true);

  /**
   * Cleanup on unmount.
   */
  useEffect(
    () => {
      return () => {
        mountedRef.current =
          false;

        if (
          abortControllerRef.current
        ) {
          abortControllerRef.current.abort();
        }
      };
    },
    []
  );

  /**
   * Set selected model.
   */
  const setModel =
    useCallback(
      (model) => {
        setState(
          (current) => ({
            ...current,
            model,
          })
        );
      },
      []
    );

  /**
   * Set prompt.
   */
  const setPrompt =
    useCallback(
      (prompt) => {
        setState(
          (current) => ({
            ...current,
            prompt:
              prompt || "",
          })
        );
      },
      []
    );

  /**
   * Update one generation parameter.
   */
  const setParameter =
    useCallback(
      (
        key,
        value
      ) => {
        setParameters(
          (current) => ({
            ...current,
            [key]: value,
          })
        );
      },
      []
    );

  /**
   * Update multiple parameters.
   */
  const updateParameters =
    useCallback(
      (updates) => {
        if (!updates) {
          return;
        }

        setParameters(
          (current) => ({
            ...current,
            ...updates,
          })
        );
      },
      []
    );

  /**
   * Reset generation parameters.
   */
  const resetParameters =
    useCallback(
      () => {
        setParameters(
          DEFAULT_PARAMETERS
        );
      },
      []
    );

  /**
   * Build request payload.
   */
  const buildRequestPayload =
    useCallback(
      (
        overrides = {}
      ) => {
        const currentModel =
          overrides.model ||
          state.model;

        const currentPrompt =
          overrides.prompt ??
          state.prompt;

        if (!currentModel) {
          throw new Error(
            "Please select a model."
          );
        }

        if (
          !currentPrompt ||
          !currentPrompt.trim()
        ) {
          throw new Error(
            "Please enter a prompt."
          );
        }

        const modelId =
          typeof currentModel ===
          "string"
            ? currentModel
            : currentModel.id ||
              currentModel.modelId ||
              currentModel.name;

        return {
          model:
            modelId,

          prompt:
            currentPrompt,

          parameters: {
            ...parameters,
            ...(overrides.parameters ||
              {}),
          },

          messages:
            overrides.messages ||
            state.messages,

          stream:
            overrides.stream ??
            false,

          ...overrides,
        };
      },
      [
        state.model,
        state.prompt,
        state.messages,
        parameters,
      ]
    );

  /**
   * Add message to history.
   */
  const addMessage =
    useCallback(
      (
        message
      ) => {
        if (!message) {
          return;
        }

        setState(
          (current) => {
            const nextMessages = [
              ...current.messages,
              message,
            ];

            return {
              ...current,
              messages:
                nextMessages.slice(
                  -maxHistory
                ),
            };
          }
        );
      },
      [maxHistory]
    );

  /**
   * Clear conversation history.
   */
  const clearHistory =
    useCallback(
      () => {
        setState(
          (current) => ({
            ...current,
            messages: [],
          })
        );
      },
      []
    );

  /**
   * Execute standard completion.
   */
  const execute =
    useCallback(
      async (
        overrides = {}
      ) => {
        if (!enabled) {
          return null;
        }

        setIsLoading(true);

        setError(null);

        requestStartRef.current =
          performance.now();

        setLastRequestAt(
          new Date()
        );

        /**
         * Cancel previous request.
         */
        if (
          abortControllerRef.current
        ) {
          abortControllerRef.current.abort();
        }

        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;

        try {
          const payload =
            buildRequestPayload(
              {
                ...overrides,
                stream: false,
              }
            );

          const response =
            await playgroundApi.complete(
              payload,
              {
                signal:
                  controller.signal,
              }
            );

          if (
            !mountedRef.current
          ) {
            return response;
          }

          const data =
            normalizeResponse(
              response
            );

          const text =
            extractResponseText(
              data
            );

          const usage =
            extractUsage(data);

          const latency =
            requestStartRef.current
              ? performance.now() -
                requestStartRef.current
              : null;

          setState(
            (current) => ({
              ...current,
              response: text,
              usage,
              latency,
              requestId:
                data.requestId ||
                data.id ||
                null,
            })
          );

          setLastCompletedAt(
            new Date()
          );

          return data;
        } catch (requestError) {
          if (
            requestError?.name ===
            "AbortError"
          ) {
            return null;
          }

          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/playground/complete",
                method: "POST",
              }
            );

          setError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          if (
            mountedRef.current
          ) {
            setIsLoading(false);
          }

          abortControllerRef.current =
            null;
        }
      },
      [
        enabled,
        buildRequestPayload,
      ]
    );

  /**
   * Execute streaming completion.
   */
  const executeStream =
    useCallback(
      async (
        overrides = {},
        callbacks = {}
      ) => {
        if (!enabled) {
          return null;
        }

        const {
          onChunk,
          onComplete,
          onError,
        } = callbacks;

        setIsStreaming(true);

        setError(null);

        /**
         * Reset current response
         * before streaming.
         */
        setState(
          (current) => ({
            ...current,
            response: "",
            usage: null,
            latency: null,
            requestId: null,
          })
        );

        requestStartRef.current =
          performance.now();

        setLastRequestAt(
          new Date()
        );

        /**
         * Cancel previous request.
         */
        if (
          abortControllerRef.current
        ) {
          abortControllerRef.current.abort();
        }

        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;

        let accumulatedText = "";

        try {
          const payload =
            buildRequestPayload(
              {
                ...overrides,
                stream: true,
              }
            );

          /**
           * Expected service contract:
           *
           * playgroundApi.stream(
           *   payload,
           *   {
           *     signal,
           *     onChunk,
           *   }
           * )
           */
          const result =
            await playgroundApi.stream(
              payload,
              {
                signal:
                  controller.signal,

                onChunk: (
                  chunk
                ) => {
                  if (
                    !mountedRef.current
                  ) {
                    return;
                  }

                  const text =
                    typeof chunk ===
                    "string"
                      ? chunk
                      : extractResponseText(
                          chunk
                        );

                  if (!text) {
                    return;
                  }

                  accumulatedText +=
                    text;

                  setState(
                    (current) => ({
                      ...current,
                      response:
                        accumulatedText,
                    })
                  );

                  if (
                    typeof onChunk ===
                    "function"
                  ) {
                    onChunk(
                      text,
                      accumulatedText
                    );
                  }
                },
              }
            );

          if (
            !mountedRef.current
          ) {
            return result;
          }

          const data =
            normalizeResponse(
              result
            );

          const finalText =
            extractResponseText(
              data
            ) ||
            accumulatedText;

          const usage =
            extractUsage(data);

          const latency =
            requestStartRef.current
              ? performance.now() -
                requestStartRef.current
              : null;

          setState(
            (current) => ({
              ...current,
              response:
                finalText,
              usage,
              latency,
              requestId:
                data.requestId ||
                data.id ||
                null,
            })
          );

          setLastCompletedAt(
            new Date()
          );

          if (
            typeof onComplete ===
            "function"
          ) {
            onComplete(
              data,
              finalText
            );
          }

          return data;
        } catch (requestError) {
          if (
            requestError?.name ===
            "AbortError"
          ) {
            return null;
          }

          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/playground/stream",
                method: "POST",
              }
            );

          setError(
            normalizedError
          );

          if (
            typeof onError ===
            "function"
          ) {
            onError(
              normalizedError
            );
          }

          throw normalizedError;
        } finally {
          if (
            mountedRef.current
          ) {
            setIsStreaming(false);
          }

          abortControllerRef.current =
            null;
        }
      },
      [
        enabled,
        buildRequestPayload,
      ]
    );

  /**
   * Send prompt.
   *
   * Automatically adds
   * user and assistant messages
   * to conversation history.
   */
  const sendMessage =
    useCallback(
      async (
        prompt,
        options = {}
      ) => {
        const userPrompt =
          prompt ??
          state.prompt;

        if (
          !userPrompt ||
          !userPrompt.trim()
        ) {
          throw new Error(
            "Please enter a prompt."
          );
        }

        const userMessage = {
          id:
            `user-${Date.now()}`,
          role: "user",
          content:
            userPrompt,
          createdAt:
            new Date().toISOString(),
        };

        addMessage(
          userMessage
        );

        const requestMessages = [
          ...state.messages,
          userMessage,
        ].slice(
          -maxHistory
        );

        const result =
          options.stream
            ? await executeStream(
                {
                  ...options,
                  prompt:
                    userPrompt,
                  messages:
                    requestMessages,
                },
                options
              )
            : await execute(
                {
                  ...options,
                  prompt:
                    userPrompt,
                  messages:
                    requestMessages,
                }
              );

        const assistantText =
          options.stream
            ? state.response
            : extractResponseText(
                result
              );

        /**
         * Add assistant response.
         *
         * Streaming state may update
         * asynchronously, so callers
         * can also manually manage
         * history if required.
         */
        if (
          assistantText
        ) {
          addMessage({
            id:
              `assistant-${Date.now()}`,
            role: "assistant",
            content:
              assistantText,
            createdAt:
              new Date().toISOString(),
          });
        }

        return result;
      },
      [
        state.prompt,
        state.messages,
        state.response,
        maxHistory,
        addMessage,
        execute,
        executeStream,
      ]
    );

  /**
   * Stop active generation.
   */
  const stopGeneration =
    useCallback(
      () => {
        if (
          !abortControllerRef.current
        ) {
          return false;
        }

        setIsCancelling(true);

        abortControllerRef.current.abort();

        abortControllerRef.current =
          null;

        setIsLoading(false);

        setIsStreaming(false);

        setIsCancelling(false);

        return true;
      },
      []
    );

  /**
   * Clear current response.
   */
  const clearResponse =
    useCallback(
      () => {
        setState(
          (current) => ({
            ...current,
            response: "",
            usage: null,
            latency: null,
            requestId: null,
          })
        );
      },
      []
    );

  /**
   * Reset complete playground.
   */
  const reset =
    useCallback(
      () => {
        stopGeneration();

        setState({
          ...DEFAULT_STATE,
          model:
            initialModel,
            prompt:
              initialPrompt,
        });

        setParameters({
          ...DEFAULT_PARAMETERS,
          ...initialParameters,
        });

        setError(null);

        setLastRequestAt(null);

        setLastCompletedAt(null);
      },
      [
        initialModel,
        initialPrompt,
        initialParameters,
        stopGeneration,
      ]
    );

  /**
   * Clear errors.
   */
  const clearError =
    useCallback(
      () => {
        setError(null);
      },
      []
    );

  /**
   * Check whether a request
   * is currently running.
   */
  const isRunning =
    isLoading ||
    isStreaming;

  /**
   * Check whether response exists.
   */
  const hasResponse =
    Boolean(
      state.response &&
      state.response.trim()
    );

  /**
   * Check whether conversation
   * has messages.
   */
  const hasMessages =
    state.messages.length > 0;

  /**
   * Return public API.
   */
  return {
    /**
     * Core state.
     */
    model:
      state.model,

    prompt:
      state.prompt,

    response:
      state.response,

    messages:
      state.messages,

    usage:
      state.usage,

    latency:
      state.latency,

    requestId:
      state.requestId,

    /**
     * Generation parameters.
     */
    parameters,

    /**
     * Loading state.
     */
    isLoading,

    isStreaming,

    isCancelling,

    isRunning,

    /**
     * Derived state.
     */
    hasResponse,

    hasMessages,

    /**
     * Errors.
     */
    error,

    /**
     * Metadata.
     */
    lastRequestAt,

    lastCompletedAt,

    /**
     * State setters.
     */
    setModel,

    setPrompt,

    /**
     * Parameters.
     */
    setParameter,

    updateParameters,

    resetParameters,

    /**
     * Execution.
     */
    execute,

    executeStream,

    sendMessage,

    /**
     * Conversation.
     */
    addMessage,

    clearHistory,

    /**
     * Controls.
     */
    stopGeneration,

    clearResponse,

    reset,

    clearError,

    /**
     * Request payload helper.
     */
    buildRequestPayload,
  };
};

export default usePlayground;