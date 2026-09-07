import apiClient from "../../api/client";

/**
 * Integration API Service
 *
 * Responsible for:
 * - Listing integrations
 * - Getting integration details
 * - Creating integrations
 * - Updating integrations
 * - Deleting integrations
 * - Testing connections
 * - Connecting/disconnecting integrations
 * - Enabling/disabling integrations
 * - Synchronizing integration data
 */

/**
 * Extract response payload.
 */
const getResponseData = (
  response
) => {
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
const buildQueryParams = (
  params = {}
) => {
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
 * Get all integrations.
 */
export const getIntegrations =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/integrations",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get a single integration.
 */
export const getIntegration =
  async (integrationId) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/integrations/${encodeURIComponent(
          integrationId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Create a new integration.
 */
export const createIntegration =
  async (
    integrationData
  ) => {
    if (
      !integrationData ||
      typeof integrationData !==
        "object"
    ) {
      throw new Error(
        "Integration data is required."
      );
    }

    const response =
      await apiClient.post(
        "/integrations",
        integrationData
      );

    return getResponseData(
      response
    );
  };

/**
 * Update an integration.
 */
export const updateIntegration =
  async (
    integrationId,
    integrationData
  ) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    if (
      !integrationData ||
      typeof integrationData !==
        "object"
    ) {
      throw new Error(
        "Integration data is required."
      );
    }

    const response =
      await apiClient.put(
        `/integrations/${encodeURIComponent(
          integrationId
        )}`,
        integrationData
      );

    return getResponseData(
      response
    );
  };

/**
 * Partially update an integration.
 */
export const patchIntegration =
  async (
    integrationId,
    integrationData
  ) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    if (
      !integrationData ||
      typeof integrationData !==
        "object"
    ) {
      throw new Error(
        "Integration data is required."
      );
    }

    const response =
      await apiClient.patch(
        `/integrations/${encodeURIComponent(
          integrationId
        )}`,
        integrationData
      );

    return getResponseData(
      response
    );
  };

/**
 * Delete an integration.
 */
export const deleteIntegration =
  async (integrationId) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.delete(
        `/integrations/${encodeURIComponent(
          integrationId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Test integration connection.
 */
export const testIntegrationConnection =
  async (
    integrationId,
    connectionData = {}
  ) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/test`,
        connectionData
      );

    return getResponseData(
      response
    );
  };

/**
 * Connect an integration.
 */
export const connectIntegration =
  async (
    integrationId,
    connectionData = {}
  ) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/connect`,
        connectionData
      );

    return getResponseData(
      response
    );
  };

/**
 * Disconnect an integration.
 */
export const disconnectIntegration =
  async (integrationId) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/disconnect`
      );

    return getResponseData(
      response
    );
  };

/**
 * Enable an integration.
 */
export const enableIntegration =
  async (integrationId) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/enable`
      );

    return getResponseData(
      response
    );
  };

/**
 * Disable an integration.
 */
export const disableIntegration =
  async (integrationId) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/disable`
      );

    return getResponseData(
      response
    );
  };

/**
 * Synchronize an integration.
 */
export const syncIntegration =
  async (
    integrationId,
    syncData = {}
  ) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/sync`,
        syncData
      );

    return getResponseData(
      response
    );
  };

/**
 * Get integration synchronization status.
 */
export const getIntegrationSyncStatus =
  async (integrationId) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/sync/status`
      );

    return getResponseData(
      response
    );
  };

/**
 * Get available integration providers.
 */
export const getIntegrationProviders =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/integrations/providers",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get integration health.
 */
export const getIntegrationHealth =
  async (integrationId) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/health`
      );

    return getResponseData(
      response
    );
  };

/**
 * Get integration logs.
 */
export const getIntegrationLogs =
  async (
    integrationId,
    params = {}
  ) => {
    if (!integrationId) {
      throw new Error(
        "Integration ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/integrations/${encodeURIComponent(
          integrationId
        )}/logs`,
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Integration API service.
 */
const integrationApi = {
  getIntegrations,

  getIntegration,

  createIntegration,

  updateIntegration,

  patchIntegration,

  deleteIntegration,

  testIntegrationConnection,

  connectIntegration,

  disconnectIntegration,

  enableIntegration,

  disableIntegration,

  syncIntegration,

  getIntegrationSyncStatus,

  getIntegrationProviders,

  getIntegrationHealth,

  getIntegrationLogs,
};

export default integrationApi;