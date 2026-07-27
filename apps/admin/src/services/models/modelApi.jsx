/**
 * Model API Service
 *
 * Central API service for managing AI/ML models.
 *
 * Supports:
 * - List models
 * - Get model
 * - Create model
 * - Update model
 * - Delete model
 * - Deploy model
 * - Undeploy model
 * - Activate model
 * - Deactivate model
 * - Model health
 * - Model metrics
 * - Model versions
 * - Model configuration
 * - Model testing
 * - Model search and filtering
 */

import apiClient from "../../api/client";

/* =================================================
   API Endpoints
================================================= */

const MODEL_ENDPOINTS = {
  BASE: "/models",

  BY_ID: (modelId) =>
    `/models/${modelId}`,

  DEPLOY: (modelId) =>
    `/models/${modelId}/deploy`,

  UNDEPLOY: (modelId) =>
    `/models/${modelId}/undeploy`,

  ACTIVATE: (modelId) =>
    `/models/${modelId}/activate`,

  DEACTIVATE: (modelId) =>
    `/models/${modelId}/deactivate`,

  HEALTH: (modelId) =>
    `/models/${modelId}/health`,

  METRICS: (modelId) =>
    `/models/${modelId}/metrics`,

  VERSIONS: (modelId) =>
    `/models/${modelId}/versions`,

  CONFIGURATION: (modelId) =>
    `/models/${modelId}/configuration`,

  TEST: (modelId) =>
    `/models/${modelId}/test`,

  LOGS: (modelId) =>
    `/models/${modelId}/logs`,
};

/* =================================================
   Utility: Validate Model ID
================================================= */

function validateModelId(
  modelId
) {
  if (
    modelId ===
      undefined ||
    modelId === null ||
    modelId === ""
  ) {
    throw new Error(
      "Model ID is required."
    );
  }
}

/* =================================================
   Utility: Clean Parameters
================================================= */

function cleanParams(
  params = {}
) {
  return Object.fromEntries(
    Object.entries(
      params
    ).filter(
      ([, value]) =>
        value !==
          undefined &&
        value !== null &&
        value !== ""
    )
  );
}

/* =================================================
   Get Models
================================================= */

export async function getModels(
  params = {}
) {
  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.BASE,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Model By ID
================================================= */

export async function getModel(
  modelId
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.BY_ID(
        modelId
      )
    );

  return response.data;
}

/* =================================================
   Create Model
================================================= */

export async function createModel(
  modelData
) {
  if (
    !modelData ||
    typeof modelData !==
      "object"
  ) {
    throw new Error(
      "Model data is required."
    );
  }

  const response =
    await apiClient.post(
      MODEL_ENDPOINTS.BASE,
      modelData
    );

  return response.data;
}

/* =================================================
   Update Model
================================================= */

export async function updateModel(
  modelId,
  modelData
) {
  validateModelId(
    modelId
  );

  if (
    !modelData ||
    typeof modelData !==
      "object"
  ) {
    throw new Error(
      "Model update data is required."
    );
  }

  const response =
    await apiClient.patch(
      MODEL_ENDPOINTS.BY_ID(
        modelId
      ),
      modelData
    );

  return response.data;
}

/* =================================================
   Replace Model
================================================= */

export async function replaceModel(
  modelId,
  modelData
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.put(
      MODEL_ENDPOINTS.BY_ID(
        modelId
      ),
      modelData
    );

  return response.data;
}

/* =================================================
   Delete Model
================================================= */

export async function deleteModel(
  modelId
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.delete(
      MODEL_ENDPOINTS.BY_ID(
        modelId
      )
    );

  return response.data;
}

/* =================================================
   Deploy Model
================================================= */

export async function deployModel(
  modelId,
  deploymentConfig = {}
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.post(
      MODEL_ENDPOINTS.DEPLOY(
        modelId
      ),
      deploymentConfig
    );

  return response.data;
}

/* =================================================
   Undeploy Model
================================================= */

export async function undeployModel(
  modelId
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.post(
      MODEL_ENDPOINTS.UNDEPLOY(
        modelId
      )
    );

  return response.data;
}

/* =================================================
   Activate Model
================================================= */

export async function activateModel(
  modelId
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.post(
      MODEL_ENDPOINTS.ACTIVATE(
        modelId
      )
    );

  return response.data;
}

/* =================================================
   Deactivate Model
================================================= */

export async function deactivateModel(
  modelId
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.post(
      MODEL_ENDPOINTS.DEACTIVATE(
        modelId
      )
    );

  return response.data;
}

/* =================================================
   Get Model Health
================================================= */

export async function getModelHealth(
  modelId
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.HEALTH(
        modelId
      )
    );

  return response.data;
}

/* =================================================
   Get Model Metrics
================================================= */

export async function getModelMetrics(
  modelId,
  params = {}
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.METRICS(
        modelId
      ),
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Model Versions
================================================= */

export async function getModelVersions(
  modelId,
  params = {}
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.VERSIONS(
        modelId
      ),
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Create Model Version
================================================= */

export async function createModelVersion(
  modelId,
  versionData
) {
  validateModelId(
    modelId
  );

  if (
    !versionData ||
    typeof versionData !==
      "object"
  ) {
    throw new Error(
      "Version data is required."
    );
  }

  const response =
    await apiClient.post(
      MODEL_ENDPOINTS.VERSIONS(
        modelId
      ),
      versionData
    );

  return response.data;
}

/* =================================================
   Get Model Configuration
================================================= */

export async function getModelConfiguration(
  modelId
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.CONFIGURATION(
        modelId
      )
    );

  return response.data;
}

/* =================================================
   Update Model Configuration
================================================= */

export async function updateModelConfiguration(
  modelId,
  configuration
) {
  validateModelId(
    modelId
  );

  if (
    !configuration ||
    typeof configuration !==
      "object"
  ) {
    throw new Error(
      "Model configuration is required."
    );
  }

  const response =
    await apiClient.patch(
      MODEL_ENDPOINTS.CONFIGURATION(
        modelId
      ),
      configuration
    );

  return response.data;
}

/* =================================================
   Test Model
================================================= */

export async function testModel(
  modelId,
  testPayload
) {
  validateModelId(
    modelId
  );

  if (
    !testPayload ||
    typeof testPayload !==
      "object"
  ) {
    throw new Error(
      "Test payload is required."
    );
  }

  const response =
    await apiClient.post(
      MODEL_ENDPOINTS.TEST(
        modelId
      ),
      testPayload
    );

  return response.data;
}

/* =================================================
   Get Model Logs
================================================= */

export async function getModelLogs(
  modelId,
  params = {}
) {
  validateModelId(
    modelId
  );

  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.LOGS(
        modelId
      ),
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Search Models
================================================= */

export async function searchModels(
  search,
  params = {}
) {
  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.BASE,
      {
        params:
          cleanParams({
            search,

            ...params,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Filter Models
================================================= */

export async function filterModels(
  filters = {}
) {
  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.BASE,
      {
        params:
          cleanParams(
            filters
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Active Models
================================================= */

export async function getActiveModels(
  params = {}
) {
  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.BASE,
      {
        params:
          cleanParams({
            status:
              "active",

            ...params,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Get Deployed Models
================================================= */

export async function getDeployedModels(
  params = {}
) {
  const response =
    await apiClient.get(
      MODEL_ENDPOINTS.BASE,
      {
        params:
          cleanParams({
            status:
              "deployed",

            ...params,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Bulk Activate Models
================================================= */

export async function bulkActivateModels(
  modelIds = []
) {
  if (
    !Array.isArray(
      modelIds
    ) ||
    modelIds.length === 0
  ) {
    throw new Error(
      "At least one model ID is required."
    );
  }

  const response =
    await apiClient.post(
      `${MODEL_ENDPOINTS.BASE}/bulk/activate`,
      {
        modelIds,
      }
    );

  return response.data;
}

/* =================================================
   Bulk Deactivate Models
================================================= */

export async function bulkDeactivateModels(
  modelIds = []
) {
  if (
    !Array.isArray(
      modelIds
    ) ||
    modelIds.length === 0
  ) {
    throw new Error(
      "At least one model ID is required."
    );
  }

  const response =
    await apiClient.post(
      `${MODEL_ENDPOINTS.BASE}/bulk/deactivate`,
      {
        modelIds,
      }
    );

  return response.data;
}

/* =================================================
   Default API Object
================================================= */

const modelApi = {
  getModels,

  getModel,

  createModel,

  updateModel,

  replaceModel,

  deleteModel,

  deployModel,

  undeployModel,

  activateModel,

  deactivateModel,

  getModelHealth,

  getModelMetrics,

  getModelVersions,

  createModelVersion,

  getModelConfiguration,

  updateModelConfiguration,

  testModel,

  getModelLogs,

  searchModels,

  filterModels,

  getActiveModels,

  getDeployedModels,

  bulkActivateModels,

  bulkDeactivateModels,
};

export default modelApi;