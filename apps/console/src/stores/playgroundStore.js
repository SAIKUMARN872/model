import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import playgroundApi from "../services/playgroundApi";

/**
 * Playground Store
 *
 * Responsible for:
 * - Playground session
 * - Model selection
 * - Prompt management
 * - Generation parameters
 * - Chat messages
 * - Streaming responses
 * - Request execution
 * - Execution history
 * - Saved playground configurations
 * - Token usage
 * - Latency
 * - Errors
 */

/**
 * Default generation parameters.
 */
const defaultParameters = {
  temperature: 0.7,
  topP: 1,
  maxTokens: 1024,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stop: [],
};

/**
 * Initial state.
 */
const initialState = {
  sessionId: null,

  selectedModel: null,

  selectedModelId: null,

  prompt: "",

  systemPrompt: "",

  parameters: {
    ...defaultParameters,
  },

  messages: [],

  currentResponse: "",

  streamedResponse: "",

  executionHistory: [],

  savedConfigurations: [],

  usage: null,

  latency: null,

  requestId: null,

  isLoading: false,

  isStreaming: false,

  isSaving: false,

  error: null,

  streamError: null,

  lastExecutedAt: null,
};

/**
 * Normalize API collection response.
 */
const normalizeCollection = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  return (
    response?.items ||
    response?.data ||
    response?.results ||
    []
  );
};

/**
 * Playground Store.
 */
const usePlaygroundStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Set session ID.
         */
        setSessionId: (
          sessionId
        ) => {
          set(
            {
              sessionId,
            },
            false,
            "playground/setSessionId"
          );
        },

        /**
         * Set selected model.
         */
        setSelectedModel: (
          model
        ) => {
          set(
            {
              selectedModel:
                model,

              selectedModelId:
                model?.id ||
                model?.modelId ||
                model?.name ||
                null,
            },
            false,
            "playground/setSelectedModel"
          );
        },

        /**
         * Set selected model ID.
         */
        setSelectedModelId: (
          modelId
        ) => {
          set(
            {
              selectedModelId:
                modelId,
            },
            false,
            "playground/setSelectedModelId"
          );
        },

        /**
         * Set prompt.
         */
        setPrompt: (
          prompt
        ) => {
          set(
            {
              prompt:
                prompt || "",
            },
            false,
            "playground/setPrompt"
          );
        },

        /**
         * Set system prompt.
         */
        setSystemPrompt: (
          systemPrompt
        ) => {
          set(
            {
              systemPrompt:
                systemPrompt || "",
            },
            false,
            "playground/setSystemPrompt"
          );
        },

        /**
         * Set all parameters.
         */
        setParameters: (
          parameters
        ) => {
          set(
            (state) => ({
              parameters: {
                ...state.parameters,
                ...parameters,
              },
            }),
            false,
            "playground/setParameters"
          );
        },

        /**
         * Set individual parameter.
         */
        setParameter: (
          key,
          value
        ) => {
          set(
            (state) => ({
              parameters: {
                ...state.parameters,
                [key]: value,
              },
            }),
            false,
            "playground/setParameter"
          );
        },

        /**
         * Reset parameters.
         */
        resetParameters: () => {
          set(
            {
              parameters: {
                ...defaultParameters,
              },
            },
            false,
            "playground/resetParameters"
          );
        },

        /**
         * Add a message.
         */
        addMessage: (
          message
        ) => {
          set(
            (state) => ({
              messages: [
                ...state.messages,
                {
                  id:
                    message.id ||
                    `${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2)}`,

                  role:
                    message.role ||
                    "user",

                  content:
                    message.content ||
                    "",

                  createdAt:
                    message.createdAt ||
                    new Date().toISOString(),
                },
              ],
            }),
            false,
            "playground/addMessage"
          );
        },

        /**
         * Update message.
         */
        updateMessage: (
          messageId,
          updates
        ) => {
          set(
            (state) => ({
              messages:
                state.messages.map(
                  (message) =>
                    message.id ===
                    messageId
                      ? {
                          ...message,
                          ...updates,
                        }
                      : message
                ),
            }),
            false,
            "playground/updateMessage"
          );
        },

        /**
         * Remove message.
         */
        removeMessage: (
          messageId
        ) => {
          set(
            (state) => ({
              messages:
                state.messages.filter(
                  (message) =>
                    message.id !==
                    messageId
                ),
            }),
            false,
            "playground/removeMessage"
          );
        },

        /**
         * Clear messages.
         */
        clearMessages: () => {
          set(
            {
              messages: [],
              currentResponse: "",
              streamedResponse: "",
            },
            false,
            "playground/clearMessages"
          );
        },

        /**
         * Set current response.
         */
        setCurrentResponse: (
          response
        ) => {
          set(
            {
              currentResponse:
                response || "",
            },
            false,
            "playground/setCurrentResponse"
          );
        },

        /**
         * Append streaming content.
         */
        appendStreamChunk: (
          chunk
        ) => {
          set(
            (state) => ({
              streamedResponse:
                state.streamedResponse +
                (chunk || ""),
            }),
            false,
            "playground/appendStreamChunk"
          );
        },

        /**
         * Clear streaming response.
         */
        clearStream: () => {
          set(
            {
              streamedResponse: "",
              streamError: null,
            },
            false,
            "playground/clearStream"
          );
        },

        /**
         * Set loading state.
         */
        setLoading: (
          isLoading
        ) => {
          set(
            {
              isLoading,
            },
            false,
            "playground/setLoading"
          );
        },

        /**
         * Set streaming state.
         */
        setStreaming: (
          isStreaming
        ) => {
          set(
            {
              isStreaming,
            },
            false,
            "playground/setStreaming"
          );
        },

        /**
         * Set error.
         */
        setError: (
          error
        ) => {
          set(
            {
              error:
                error?.message ||
                error ||
                "An unexpected error occurred.",
            },
            false,
            "playground/setError"
          );
        },

        /**
         * Clear error.
         */
        clearError: () => {
          set(
            {
              error: null,
              streamError: null,
            },
            false,
            "playground/clearError"
          );
        },

        /**
         * Create playground session.
         */
        createSession: async (
          sessionData = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "playground/createSession/start"
            );

            const data =
              await playgroundApi.createSession(
                sessionData
              );

            set(
              {
                sessionId:
                  data?.id ||
                  data?.sessionId ||
                  null,

                isLoading: false,
              },
              false,
              "playground/createSession/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to create playground session.",
              },
              false,
              "playground/createSession/error"
            );

            throw error;
          }
        },

        /**
         * Get playground session.
         */
        fetchSession: async (
          sessionId
        ) => {
          try {
            const id =
              sessionId ||
              get().sessionId;

            if (!id) {
              throw new Error(
                "Session ID is required."
              );
            }

            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "playground/fetchSession/start"
            );

            const data =
              await playgroundApi.getSession(
                id
              );

            set(
              {
                sessionId:
                  data?.id ||
                  data?.sessionId ||
                  id,

                selectedModel:
                  data?.model ||
                  null,

                selectedModelId:
                  data?.modelId ||
                  data?.model?.id ||
                  null,

                prompt:
                  data?.prompt ||
                  "",

                systemPrompt:
                  data?.systemPrompt ||
                  "",

                parameters: {
                  ...defaultParameters,
                  ...(data?.parameters ||
                    {}),
                },

                messages:
                  Array.isArray(
                    data?.messages
                  )
                    ? data.messages
                    : [],

                isLoading: false,
              },
              false,
              "playground/fetchSession/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to fetch playground session.",
              },
              false,
              "playground/fetchSession/error"
            );

            throw error;
          }
        },

        /**
         * Update playground session.
         */
        updateSession: async (
          sessionData
        ) => {
          try {
            const sessionId =
              get().sessionId;

            if (!sessionId) {
              throw new Error(
                "Session ID is required."
              );
            }

            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "playground/updateSession/start"
            );

            const data =
              await playgroundApi.updateSession(
                sessionId,
                sessionData
              );

            set(
              {
                isLoading: false,
              },
              false,
              "playground/updateSession/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to update playground session.",
              },
              false,
              "playground/updateSession/error"
            );

            throw error;
          }
        },

        /**
         * Delete playground session.
         */
        deleteSession: async (
          sessionId
        ) => {
          try {
            const id =
              sessionId ||
              get().sessionId;

            if (!id) {
              throw new Error(
                "Session ID is required."
              );
            }

            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "playground/deleteSession/start"
            );

            const data =
              await playgroundApi.deleteSession(
                id
              );

            set(
              {
                ...initialState,
              },
              false,
              "playground/deleteSession/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to delete playground session.",
              },
              false,
              "playground/deleteSession/error"
            );

            throw error;
          }
        },

        /**
         * Execute prompt.
         */
        execute: async (
          requestData = {}
        ) => {
          try {
            const state =
              get();

            const payload = {
              sessionId:
                requestData.sessionId ||
                state.sessionId,

              modelId:
                requestData.modelId ||
                state.selectedModelId,

              prompt:
                requestData.prompt ??
                state.prompt,

              systemPrompt:
                requestData.systemPrompt ??
                state.systemPrompt,

              messages:
                requestData.messages ||
                state.messages,

              parameters: {
                ...state.parameters,
                ...(requestData.parameters ||
                  {}),
              },
            };

            if (!payload.modelId) {
              throw new Error(
                "Please select a model before executing."
              );
            }

            if (
              !payload.prompt &&
              !payload.messages.length
            ) {
              throw new Error(
                "Please enter a prompt before executing."
              );
            }

            set(
              {
                isLoading: true,
                error: null,
                currentResponse: "",
                streamedResponse: "",
              },
              false,
              "playground/execute/start"
            );

            const data =
              await playgroundApi.execute(
                payload
              );

            const responseText =
              data?.response ||
              data?.content ||
              data?.text ||
              "";

            set(
              (state) => ({
                currentResponse:
                  responseText,

                usage:
                  data?.usage ||
                  null,

                latency:
                  data?.latency ||
                  null,

                requestId:
                  data?.requestId ||
                  null,

                isLoading: false,

                lastExecutedAt:
                  new Date().toISOString(),

                executionHistory: [
                  {
                    id:
                      data?.requestId ||
                      `${Date.now()}`,

                    modelId:
                      payload.modelId,

                    prompt:
                      payload.prompt,

                    response:
                      responseText,

                    usage:
                      data?.usage ||
                      null,

                    latency:
                      data?.latency ||
                      null,

                    createdAt:
                      new Date().toISOString(),
                  },

                  ...state.executionHistory,
                ],
              }),
              false,
              "playground/execute/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to execute playground request.",
              },
              false,
              "playground/execute/error"
            );

            throw error;
          }
        },

        /**
         * Execute streaming request.
         */
        executeStream: async (
          requestData = {},
          callbacks = {}
        ) => {
          try {
            const state =
              get();

            const payload = {
              sessionId:
                requestData.sessionId ||
                state.sessionId,

              modelId:
                requestData.modelId ||
                state.selectedModelId,

              prompt:
                requestData.prompt ??
                state.prompt,

              systemPrompt:
                requestData.systemPrompt ??
                state.systemPrompt,

              messages:
                requestData.messages ||
                state.messages,

              parameters: {
                ...state.parameters,
                ...(requestData.parameters ||
                  {}),
              },
            };

            if (!payload.modelId) {
              throw new Error(
                "Please select a model before executing."
              );
            }

            set(
              {
                isStreaming: true,
                streamError: null,
                error: null,
                streamedResponse: "",
                currentResponse: "",
              },
              false,
              "playground/executeStream/start"
            );

            const result =
              await playgroundApi.stream(
                payload,
                {
                  onChunk: (
                    chunk
                  ) => {
                    get().appendStreamChunk(
                      chunk
                    );

                    if (
                      typeof callbacks.onChunk ===
                      "function"
                    ) {
                      callbacks.onChunk(
                        chunk
                      );
                    }
                  },

                  onComplete: (
                    data
                  ) => {
                    const finalResponse =
                      data?.response ||
                      data?.content ||
                      get()
                        .streamedResponse;

                    set(
                      {
                        currentResponse:
                          finalResponse,

                        usage:
                          data?.usage ||
                          null,

                        latency:
                          data?.latency ||
                          null,

                        requestId:
                          data?.requestId ||
                          null,

                        isStreaming:
                          false,

                        lastExecutedAt:
                          new Date().toISOString(),
                      },
                      false,
                      "playground/executeStream/complete"
                    );

                    if (
                      typeof callbacks.onComplete ===
                      "function"
                    ) {
                      callbacks.onComplete(
                        data
                      );
                    }
                  },

                  onError: (
                    streamError
                  ) => {
                    set(
                      {
                        isStreaming:
                          false,

                        streamError:
                          streamError?.message ||
                          streamError ||
                          "Streaming request failed.",
                      },
                      false,
                      "playground/executeStream/streamError"
                    );

                    if (
                      typeof callbacks.onError ===
                      "function"
                    ) {
                      callbacks.onError(
                        streamError
                      );
                    }
                  },
                }
              );

            set(
              {
                isStreaming: false,
              },
              false,
              "playground/executeStream/success"
            );

            return result;
          } catch (error) {
            set(
              {
                isStreaming: false,

                streamError:
                  error?.message ||
                  "Failed to execute streaming request.",
              },
              false,
              "playground/executeStream/error"
            );

            throw error;
          }
        },

        /**
         * Fetch execution history.
         */
        fetchExecutionHistory:
          async (
            params = {}
          ) => {
            try {
              set(
                {
                  isLoading: true,
                  error: null,
                },
                false,
                "playground/fetchExecutionHistory/start"
              );

              const response =
                await playgroundApi.getHistory(
                  params
                );

              set(
                {
                  executionHistory:
                    normalizeCollection(
                      response
                    ),

                  isLoading: false,
                },
                false,
                "playground/fetchExecutionHistory/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  isLoading: false,

                  error:
                    error?.message ||
                    "Failed to fetch execution history.",
                },
                false,
                "playground/fetchExecutionHistory/error"
              );

              throw error;
            }
          },

        /**
         * Clear execution history.
         */
        clearExecutionHistory: () => {
          set(
            {
              executionHistory: [],
            },
            false,
            "playground/clearExecutionHistory"
          );
        },

        /**
         * Fetch saved configurations.
         */
        fetchSavedConfigurations:
          async (
            params = {}
          ) => {
            try {
              const response =
                await playgroundApi.getConfigurations(
                  params
                );

              set(
                {
                  savedConfigurations:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "playground/fetchSavedConfigurations/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch saved configurations.",
                },
                false,
                "playground/fetchSavedConfigurations/error"
              );

              throw error;
            }
          },

        /**
         * Save configuration.
         */
        saveConfiguration: async (
          configurationData
        ) => {
          try {
            set(
              {
                isSaving: true,
                error: null,
              },
              false,
              "playground/saveConfiguration/start"
            );

            const state =
              get();

            const payload = {
              ...configurationData,

              modelId:
                configurationData?.modelId ||
                state.selectedModelId,

              prompt:
                configurationData?.prompt ??
                state.prompt,

              systemPrompt:
                configurationData?.systemPrompt ??
                state.systemPrompt,

              parameters: {
                ...state.parameters,
                ...(configurationData?.parameters ||
                  {}),
              },
            };

            const data =
              await playgroundApi.createConfiguration(
                payload
              );

            set(
              (state) => ({
                savedConfigurations: [
                  data,
                  ...state.savedConfigurations,
                ],

                isSaving: false,
              }),
              false,
              "playground/saveConfiguration/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isSaving: false,

                error:
                  error?.message ||
                  "Failed to save playground configuration.",
              },
              false,
              "playground/saveConfiguration/error"
            );

            throw error;
          }
        },

        /**
         * Delete saved configuration.
         */
        deleteConfiguration: async (
          configurationId
        ) => {
          try {
            if (!configurationId) {
              throw new Error(
                "Configuration ID is required."
              );
            }

            set(
              {
                isSaving: true,
                error: null,
              },
              false,
              "playground/deleteConfiguration/start"
            );

            const data =
              await playgroundApi.deleteConfiguration(
                configurationId
              );

            set(
              (state) => ({
                savedConfigurations:
                  state.savedConfigurations.filter(
                    (configuration) =>
                      configuration.id !==
                        configurationId &&
                      configuration.configurationId !==
                        configurationId
                  ),

                isSaving: false,
              }),
              false,
              "playground/deleteConfiguration/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isSaving: false,

                error:
                  error?.message ||
                  "Failed to delete playground configuration.",
              },
              false,
              "playground/deleteConfiguration/error"
            );

            throw error;
          }
        },

        /**
         * Load saved configuration.
         */
        loadConfiguration: (
          configuration
        ) => {
          if (!configuration) {
            return;
          }

          set(
            {
              selectedModelId:
                configuration.modelId ||
                null,

              selectedModel:
                configuration.model ||
                null,

              prompt:
                configuration.prompt ||
                "",

              systemPrompt:
                configuration.systemPrompt ||
                "",

              parameters: {
                ...defaultParameters,
                ...(configuration.parameters ||
                  {}),
              },
            },
            false,
            "playground/loadConfiguration"
          );
        },

        /**
         * Reset playground.
         */
        reset: () => {
          set(
            {
              ...initialState,
            },
            false,
            "playground/reset"
          );
        },
      }),
      {
        name: "playground-store",

        partialize: (
          state
        ) => ({
          selectedModelId:
            state.selectedModelId,

          prompt:
            state.prompt,

          systemPrompt:
            state.systemPrompt,

          parameters:
            state.parameters,
        }),
      }
    ),
    {
      name: "PlaygroundStore",
    }
  )
);

export default usePlaygroundStore;