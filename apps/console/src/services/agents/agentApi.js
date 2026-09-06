import apiClient from "../../api/client";

/**
 * Agent API Service
 *
 * Responsible for:
 * - Fetching agents
 * - Fetching a single agent
 * - Creating agents
 * - Updating agents
 * - Deleting agents
 * - Activating/deactivating agents
 * - Executing agents
 */

/**
 * Normalize API response.
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
 * Build query parameters.
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
 * Get all agents.
 */
export const getAgents = async (
  params = {}
) => {
  const response =
    await apiClient.get(
      "/agents",
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
 * Get a single agent.
 */
export const getAgent = async (
  agentId
) => {
  if (!agentId) {
    throw new Error(
      "Agent ID is required."
    );
  }

  const response =
    await apiClient.get(
      `/agents/${encodeURIComponent(
        agentId
      )}`
    );

  return getResponseData(
    response
  );
};

/**
 * Create a new agent.
 */
export const createAgent =
  async (agentData) => {
    if (
      !agentData ||
      typeof agentData !==
        "object"
    ) {
      throw new Error(
        "Agent data is required."
      );
    }

    const response =
      await apiClient.post(
        "/agents",
        agentData
      );

    return getResponseData(
      response
    );
  };

/**
 * Update an existing agent.
 */
export const updateAgent =
  async (
    agentId,
    agentData
  ) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    if (
      !agentData ||
      typeof agentData !==
        "object"
    ) {
      throw new Error(
        "Agent data is required."
      );
    }

    const response =
      await apiClient.put(
        `/agents/${encodeURIComponent(
          agentId
        )}`,
        agentData
      );

    return getResponseData(
      response
    );
  };

/**
 * Partially update an agent.
 */
export const patchAgent =
  async (
    agentId,
    agentData
  ) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    if (
      !agentData ||
      typeof agentData !==
        "object"
    ) {
      throw new Error(
        "Agent data is required."
      );
    }

    const response =
      await apiClient.patch(
        `/agents/${encodeURIComponent(
          agentId
        )}`,
        agentData
      );

    return getResponseData(
      response
    );
  };

/**
 * Delete an agent.
 */
export const deleteAgent =
  async (agentId) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    const response =
      await apiClient.delete(
        `/agents/${encodeURIComponent(
          agentId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Activate an agent.
 */
export const activateAgent =
  async (agentId) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/agents/${encodeURIComponent(
          agentId
        )}/activate`
      );

    return getResponseData(
      response
    );
  };

/**
 * Deactivate an agent.
 */
export const deactivateAgent =
  async (agentId) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/agents/${encodeURIComponent(
          agentId
        )}/deactivate`
      );

    return getResponseData(
      response
    );
  };

/**
 * Execute an agent.
 */
export const executeAgent =
  async (
    agentId,
    payload = {}
  ) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/agents/${encodeURIComponent(
          agentId
        )}/execute`,
        payload
      );

    return getResponseData(
      response
    );
  };

/**
 * Get agent execution history.
 */
export const getAgentExecutions =
  async (
    agentId,
    params = {}
  ) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/agents/${encodeURIComponent(
          agentId
        )}/executions`,
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
 * Get a single agent execution.
 */
export const getAgentExecution =
  async (
    agentId,
    executionId
  ) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    if (!executionId) {
      throw new Error(
        "Execution ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/agents/${encodeURIComponent(
          agentId
        )}/executions/${encodeURIComponent(
          executionId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Stop an agent execution.
 */
export const stopAgentExecution =
  async (
    agentId,
    executionId
  ) => {
    if (!agentId) {
      throw new Error(
        "Agent ID is required."
      );
    }

    if (!executionId) {
      throw new Error(
        "Execution ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/agents/${encodeURIComponent(
          agentId
        )}/executions/${encodeURIComponent(
          executionId
        )}/stop`
      );

    return getResponseData(
      response
    );
  };

/**
 * Export API service.
 */
const agentApi = {
  getAgents,

  getAgent,

  createAgent,

  updateAgent,

  patchAgent,

  deleteAgent,

  activateAgent,

  deactivateAgent,

  executeAgent,

  getAgentExecutions,

  getAgentExecution,

  stopAgentExecution,
};

export default agentApi;