import apiClient from "../api/client";

/**
 * Model API Service
 *
 * Responsible for:
 * - Fetching models
 * - Model details
 * - Creating models
 * - Updating models
 * - Deleting models
 * - Model deployment
 * - Model health
 * - Model configuration
 * - Model activation/deactivation
 * - Model metrics
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
 * Get all models.
 */
export const getModels = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/models",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a single model.
 */
export const getModel = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/models/${encodeURIComponent(
      modelId
    )}`
  );

  return getResponseData(response);
};

/**
 * Create a new model.
 */
export const createModel = async (
  modelData
) => {
  if (
    !modelData ||
    typeof modelData !== "object"
  ) {
    throw new Error(
      "Model data is required."
    );
  }

  const response = await apiClient.post(
    "/models",
    modelData
  );

  return getResponseData(response);
};

/**
 * Update a model.
 */
export const updateModel = async (
  modelId,
  modelData
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  if (
    !modelData ||
    typeof modelData !== "object"
  ) {
    throw new Error(
      "Model data is required."
    );
  }

  const response = await apiClient.put(
    `/models/${encodeURIComponent(
      modelId
    )}`,
    modelData
  );

  return getResponseData(response);
};

/**
 * Partially update a model.
 */
export const patchModel = async (
  modelId,
  modelData
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  if (
    !modelData ||
    typeof modelData !== "object"
  ) {
    throw new Error(
      "Model data is required."
    );
  }

  const response = await apiClient.patch(
    `/models/${encodeURIComponent(
      modelId
    )}`,
    modelData
  );

  return getResponseData(response);
};

/**
 * Delete a model.
 */
export const deleteModel = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.delete(
    `/models/${encodeURIComponent(
      modelId
    )}`
  );

  return getResponseData(response);
};

/**
 * Activate a model.
 */
export const activateModel = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.post(
    `/models/${encodeURIComponent(
      modelId
    )}/activate`
  );

  return getResponseData(response);
};

/**
 * Deactivate a model.
 */
export const deactivateModel = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.post(
    `/models/${encodeURIComponent(
      modelId
    )}/deactivate`
  );

  return getResponseData(response);
};

/**
 * Deploy a model.
 */
export const deployModel = async (
  modelId,
  deploymentData = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.post(
    `/models/${encodeURIComponent(
      modelId
    )}/deploy`,
    deploymentData
  );

  return getResponseData(response);
};

/**
 * Undeploy a model.
 */
export const undeployModel = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.post(
    `/models/${encodeURIComponent(
      modelId
    )}/undeploy`
  );

  return getResponseData(response);
};

/**
 * Get model deployment status.
 */
export const getModelDeploymentStatus =
  async (modelId) => {
    if (!modelId) {
      throw new Error(
        "Model ID is required."
      );
    }

    const response = await apiClient.get(
      `/models/${encodeURIComponent(
        modelId
      )}/deployment`
    );

    return getResponseData(response);
  };

/**
 * Get model health.
 */
export const getModelHealth = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/models/${encodeURIComponent(
      modelId
    )}/health`
  );

  return getResponseData(response);
};

/**
 * Get model configuration.
 */
export const getModelConfiguration =
  async (modelId) => {
    if (!modelId) {
      throw new Error(
        "Model ID is required."
      );
    }

    const response = await apiClient.get(
      `/models/${encodeURIComponent(
        modelId
      )}/configuration`
    );

    return getResponseData(response);
  };

/**
 * Update model configuration.
 */
export const updateModelConfiguration =
  async (
    modelId,
    configurationData
  ) => {
    if (!modelId) {
      throw new Error(
        "Model ID is required."
      );
    }

    if (
      !configurationData ||
      typeof configurationData !==
        "object"
    ) {
      throw new Error(
        "Model configuration is required."
      );
    }

    const response = await apiClient.put(
      `/models/${encodeURIComponent(
        modelId
      )}/configuration`,
      configurationData
    );

    return getResponseData(response);
  };

/**
 * Get model metrics.
 */
export const getModelMetrics = async (
  modelId,
  params = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/models/${encodeURIComponent(
      modelId
    )}/metrics`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get model usage.
 */
export const getModelUsage = async (
  modelId,
  params = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/models/${encodeURIComponent(
      modelId
    )}/usage`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get model versions.
 */
export const getModelVersions = async (
  modelId,
  params = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/models/${encodeURIComponent(
      modelId
    )}/versions`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a specific model version.
 */
export const getModelVersion = async (
  modelId,
  versionId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  if (!versionId) {
    throw new Error(
      "Version ID is required."
    );
  }

  const response = await apiClient.get(
    `/models/${encodeURIComponent(
      modelId
    )}/versions/${encodeURIComponent(
      versionId
    )}`
  );

  return getResponseData(response);
};

/**
 * Create a model version.
 */
export const createModelVersion = async (
  modelId,
  versionData
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  if (
    !versionData ||
    typeof versionData !== "object"
  ) {
    throw new Error(
      "Version data is required."
    );
  }

  const response = await apiClient.post(
    `/models/${encodeURIComponent(
      modelId
    )}/versions`,
    versionData
  );

  return getResponseData(response);
};

/**
 * Get available model providers.
 */
export const getModelProviders = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/models/providers",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get model capabilities.
 */
export const getModelCapabilities = async (
  modelId
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/models/${encodeURIComponent(
      modelId
    )}/capabilities`
  );

  return getResponseData(response);
};

/**
 * Test model connection.
 */
export const testModelConnection = async (
  modelId,
  testData = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.post(
    `/models/${encodeURIComponent(
      modelId
    )}/test`,
    testData
  );

  return getResponseData(response);
};

/**
 * Model API service.
 */
const modelApi = {
  getModels,

  getModel,

  createModel,

  updateModel,

  patchModel,

  deleteModel,

  activateModel,

  deactivateModel,

  deployModel,

  undeployModel,

  getModelDeploymentStatus,

  getModelHealth,

  getModelConfiguration,

  updateModelConfiguration,

  getModelMetrics,

  getModelUsage,

  getModelVersions,

  getModelVersion,

  createModelVersion,

  getModelProviders,

  getModelCapabilities,

  testModelConnection,
};

export default modelApi;