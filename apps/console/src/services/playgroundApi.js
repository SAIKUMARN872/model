import apiClient from "../api/client";

/**
 * Playground API Service
 *
 * Responsible for:
 * - Playground sessions
 * - Prompt execution
 * - Model execution
 * - Streaming responses
 * - Playground history
 * - Saved configurations
 * - Model parameters
 * - Token estimation
 */

/**
 * Extract response payload.
 */
const getResponseData = (response) => {
  if (
    response &&
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    return response.data;
  }

  return response;
};

/**
 * Build clean query parameters.
 */
const buildQueryParams = (params = {}) => {
  const query = {};

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query[key] = value;
      }
    }
  );

  return query;
};

/**
 * Validate playground request.
 */
const validatePlaygroundRequest = (
  requestData
) => {
  if (
    !requestData ||
    typeof requestData !== "object"
  ) {
    throw new Error(
      "Playground request data is required."
    );
  }
};

/**
 * Create a playground session.
 */
export const createPlaygroundSession =
  async (sessionData = {}) => {
    const response = await apiClient.post(
      "/playground/sessions",
      sessionData
    );

    return getResponseData(response);
  };

/**
 * Get a playground session.
 */
export const getPlaygroundSession = async (
  sessionId
) => {
  if (!sessionId) {
    throw new Error(
      "Playground session ID is required."
    );
  }

  const response = await apiClient.get(
    `/playground/sessions/${encodeURIComponent(
      sessionId
    )}`
  );

  return getResponseData(response);
};

/**
 * Update a playground session.
 */
export const updatePlaygroundSession =
  async (
    sessionId,
    sessionData
  ) => {
    if (!sessionId) {
      throw new Error(
        "Playground session ID is required."
      );
    }

    validatePlaygroundRequest(
      sessionData
    );

    const response = await apiClient.put(
      `/playground/sessions/${encodeURIComponent(
        sessionId
      )}`,
      sessionData
    );

    return getResponseData(response);
  };

/**
 * Delete a playground session.
 */
export const deletePlaygroundSession =
  async (sessionId) => {
    if (!sessionId) {
      throw new Error(
        "Playground session ID is required."
      );
    }

    const response =
      await apiClient.delete(
        `/playground/sessions/${encodeURIComponent(
          sessionId
        )}`
      );

    return getResponseData(response);
  };

/**
 * Get playground sessions.
 */
export const getPlaygroundSessions =
  async (params = {}) => {
    const response = await apiClient.get(
      "/playground/sessions",
      {
        params:
          buildQueryParams(params),
      }
    );

    return getResponseData(response);
  };

/**
 * Execute a playground request.
 */
export const executePlayground = async (
  requestData
) => {
  validatePlaygroundRequest(
    requestData
  );

  const response = await apiClient.post(
    "/playground/execute",
    requestData
  );

  return getResponseData(response);
};

/**
 * Execute a playground request for
 * a specific model.
 */
export const executeModel = async (
  modelId,
  requestData = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.post(
    `/playground/models/${encodeURIComponent(
      modelId
    )}/execute`,
    requestData
  );

  return getResponseData(response);
};

/**
 * Send a chat completion request.
 */
export const chatCompletion = async (
  requestData
) => {
  validatePlaygroundRequest(
    requestData
  );

  const response = await apiClient.post(
    "/playground/chat/completions",
    requestData
  );

  return getResponseData(response);
};

/**
 * Send a streaming playground request.
 *
 * Returns the raw Axios response so that
 * the caller can process the stream.
 */
export const streamPlayground = async (
  requestData
) => {
  validatePlaygroundRequest(
    requestData
  );

  const response = await apiClient.post(
    "/playground/stream",
    requestData,
    {
      responseType: "text",
      transitional: {
        forcedJSONParsing: false,
      },
    }
  );

  return response;
};

/**
 * Get playground execution history.
 */
export const getPlaygroundHistory =
  async (params = {}) => {
    const response = await apiClient.get(
      "/playground/history",
      {
        params:
          buildQueryParams(params),
      }
    );

    return getResponseData(response);
  };

/**
 * Get a single playground execution.
 */
export const getPlaygroundExecution =
  async (executionId) => {
    if (!executionId) {
      throw new Error(
        "Execution ID is required."
      );
    }

    const response = await apiClient.get(
      `/playground/history/${encodeURIComponent(
        executionId
      )}`
    );

    return getResponseData(response);
  };

/**
 * Delete playground execution history.
 */
export const deletePlaygroundExecution =
  async (executionId) => {
    if (!executionId) {
      throw new Error(
        "Execution ID is required."
      );
    }

    const response =
      await apiClient.delete(
        `/playground/history/${encodeURIComponent(
          executionId
        )}`
      );

    return getResponseData(response);
  };

/**
 * Clear playground history.
 */
export const clearPlaygroundHistory =
  async () => {
    const response = await apiClient.delete(
      "/playground/history"
    );

    return getResponseData(response);
  };

/**
 * Get saved playground configurations.
 */
export const getSavedConfigurations =
  async (params = {}) => {
    const response = await apiClient.get(
      "/playground/configurations",
      {
        params:
          buildQueryParams(params),
      }
    );

    return getResponseData(response);
  };

/**
 * Get a saved configuration.
 */
export const getSavedConfiguration =
  async (configurationId) => {
    if (!configurationId) {
      throw new Error(
        "Configuration ID is required."
      );
    }

    const response = await apiClient.get(
      `/playground/configurations/${encodeURIComponent(
        configurationId
      )}`
    );

    return getResponseData(response);
  };

/**
 * Create a saved configuration.
 */
export const createSavedConfiguration =
  async (configurationData) => {
    validatePlaygroundRequest(
      configurationData
    );

    const response = await apiClient.post(
      "/playground/configurations",
      configurationData
    );

    return getResponseData(response);
  };

/**
 * Update a saved configuration.
 */
export const updateSavedConfiguration =
  async (
    configurationId,
    configurationData
  ) => {
    if (!configurationId) {
      throw new Error(
        "Configuration ID is required."
      );
    }

    validatePlaygroundRequest(
      configurationData
    );

    const response = await apiClient.put(
      `/playground/configurations/${encodeURIComponent(
        configurationId
      )}`,
      configurationData
    );

    return getResponseData(response);
  };

/**
 * Delete a saved configuration.
 */
export const deleteSavedConfiguration =
  async (configurationId) => {
    if (!configurationId) {
      throw new Error(
        "Configuration ID is required."
      );
    }

    const response =
      await apiClient.delete(
        `/playground/configurations/${encodeURIComponent(
          configurationId
        )}`
      );

    return getResponseData(response);
  };

/**
 * Get available playground models.
 */
export const getPlaygroundModels =
  async (params = {}) => {
    const response = await apiClient.get(
      "/playground/models",
      {
        params:
          buildQueryParams(params),
      }
    );

    return getResponseData(response);
  };

/**
 * Get supported model parameters.
 */
export const getModelParameters = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/playground/models/${encodeURIComponent(
      modelId
    )}/parameters`
  );

  return getResponseData(response);
};

/**
 * Estimate token usage.
 */
export const estimateTokens = async (
  requestData
) => {
  validatePlaygroundRequest(
    requestData
  );

  const response = await apiClient.post(
    "/playground/tokens/estimate",
    requestData
  );

  return getResponseData(response);
};

/**
 * Get playground usage.
 */
export const getPlaygroundUsage = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/playground/usage",
    {
      params:
        buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get playground execution metrics.
 */
export const getPlaygroundMetrics =
  async (params = {}) => {
    const response = await apiClient.get(
      "/playground/metrics",
      {
        params:
          buildQueryParams(params),
      }
    );

    return getResponseData(response);
  };

/**
 * Cancel a running execution.
 */
export const cancelPlaygroundExecution =
  async (executionId) => {
    if (!executionId) {
      throw new Error(
        "Execution ID is required."
      );
    }

    const response = await apiClient.post(
      `/playground/executions/${encodeURIComponent(
        executionId
      )}/cancel`
    );

    return getResponseData(response);
  };

/**
 * Playground API service.
 */
const playgroundApi = {
  createPlaygroundSession,

  getPlaygroundSession,

  updatePlaygroundSession,

  deletePlaygroundSession,

  getPlaygroundSessions,

  executePlayground,

  executeModel,

  chatCompletion,

  streamPlayground,

  getPlaygroundHistory,

  getPlaygroundExecution,

  deletePlaygroundExecution,

  clearPlaygroundHistory,

  getSavedConfigurations,

  getSavedConfiguration,

  createSavedConfiguration,

  updateSavedConfiguration,

  deleteSavedConfiguration,

  getPlaygroundModels,

  getModelParameters,

  estimateTokens,

  getPlaygroundUsage,

  getPlaygroundMetrics,

  cancelPlaygroundExecution,
};

export default playgroundApi;