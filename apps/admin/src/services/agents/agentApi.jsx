/**
 * Agent API Service
 *
 * Central API service for managing AI agents.
 *
 * Supports:
 * - List agents
 * - Get agent
 * - Create agent
 * - Update agent
 * - Delete agent
 * - Start agent
 * - Stop agent
 * - Pause agent
 * - Resume agent
 * - Restart agent
 * - Agent health
 * - Agent metrics
 * - Search and filtering
 */

import apiClient from "../../api/client";

/* =================================================
   API Endpoints
================================================= */

const AGENT_ENDPOINTS = {
  BASE: "/agents",

  BY_ID: (agentId) =>
    `/agents/${agentId}`,

  START: (agentId) =>
    `/agents/${agentId}/start`,

  STOP: (agentId) =>
    `/agents/${agentId}/stop`,

  PAUSE: (agentId) =>
    `/agents/${agentId}/pause`,

  RESUME: (agentId) =>
    `/agents/${agentId}/resume`,

  RESTART: (agentId) =>
    `/agents/${agentId}/restart`,

  HEALTH: (agentId) =>
    `/agents/${agentId}/health`,

  METRICS: (agentId) =>
    `/agents/${agentId}/metrics`,

  LOGS: (agentId) =>
    `/agents/${agentId}/logs`,
};

/* =================================================
   Utility: Validate Agent ID
================================================= */

function validateAgentId(
  agentId
) {
  if (
    agentId ===
      undefined ||
    agentId === null ||
    agentId === ""
  ) {
    throw new Error(
      "Agent ID is required."
    );
  }
}

/* =================================================
   Utility: Normalize Params
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
   Get Agents
================================================= */

export async function getAgents(
  params = {}
) {
  const response =
    await apiClient.get(
      AGENT_ENDPOINTS.BASE,
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
   Get Agent By ID
================================================= */

export async function getAgent(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.get(
      AGENT_ENDPOINTS.BY_ID(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Create Agent
================================================= */

export async function createAgent(
  agentData
) {
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
      AGENT_ENDPOINTS.BASE,
      agentData
    );

  return response.data;
}

/* =================================================
   Update Agent
================================================= */

export async function updateAgent(
  agentId,
  agentData
) {
  validateAgentId(
    agentId
  );

  if (
    !agentData ||
    typeof agentData !==
      "object"
  ) {
    throw new Error(
      "Agent update data is required."
    );
  }

  const response =
    await apiClient.patch(
      AGENT_ENDPOINTS.BY_ID(
        agentId
      ),
      agentData
    );

  return response.data;
}

/* =================================================
   Replace Agent
================================================= */

export async function replaceAgent(
  agentId,
  agentData
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.put(
      AGENT_ENDPOINTS.BY_ID(
        agentId
      ),
      agentData
    );

  return response.data;
}

/* =================================================
   Delete Agent
================================================= */

export async function deleteAgent(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.delete(
      AGENT_ENDPOINTS.BY_ID(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Start Agent
================================================= */

export async function startAgent(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.post(
      AGENT_ENDPOINTS.START(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Stop Agent
================================================= */

export async function stopAgent(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.post(
      AGENT_ENDPOINTS.STOP(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Pause Agent
================================================= */

export async function pauseAgent(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.post(
      AGENT_ENDPOINTS.PAUSE(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Resume Agent
================================================= */

export async function resumeAgent(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.post(
      AGENT_ENDPOINTS.RESUME(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Restart Agent
================================================= */

export async function restartAgent(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.post(
      AGENT_ENDPOINTS.RESTART(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Get Agent Health
================================================= */

export async function getAgentHealth(
  agentId
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.get(
      AGENT_ENDPOINTS.HEALTH(
        agentId
      )
    );

  return response.data;
}

/* =================================================
   Get Agent Metrics
================================================= */

export async function getAgentMetrics(
  agentId,
  params = {}
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.get(
      AGENT_ENDPOINTS.METRICS(
        agentId
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
   Get Agent Logs
================================================= */

export async function getAgentLogs(
  agentId,
  params = {}
) {
  validateAgentId(
    agentId
  );

  const response =
    await apiClient.get(
      AGENT_ENDPOINTS.LOGS(
        agentId
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
   Search Agents
================================================= */

export async function searchAgents(
  search,
  params = {}
) {
  const response =
    await apiClient.get(
      AGENT_ENDPOINTS.BASE,
      {
        params:
          cleanParams({
            ...params,

            search,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Filter Agents
================================================= */

export async function filterAgents(
  filters = {}
) {
  const response =
    await apiClient.get(
      AGENT_ENDPOINTS.BASE,
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
   Bulk Start Agents
================================================= */

export async function bulkStartAgents(
  agentIds = []
) {
  if (
    !Array.isArray(
      agentIds
    ) ||
    agentIds.length === 0
  ) {
    throw new Error(
      "At least one agent ID is required."
    );
  }

  const response =
    await apiClient.post(
      `${AGENT_ENDPOINTS.BASE}/bulk/start`,
      {
        agentIds,
      }
    );

  return response.data;
}

/* =================================================
   Bulk Stop Agents
================================================= */

export async function bulkStopAgents(
  agentIds = []
) {
  if (
    !Array.isArray(
      agentIds
    ) ||
    agentIds.length === 0
  ) {
    throw new Error(
      "At least one agent ID is required."
    );
  }

  const response =
    await apiClient.post(
      `${AGENT_ENDPOINTS.BASE}/bulk/stop`,
      {
        agentIds,
      }
    );

  return response.data;
}

/* =================================================
   Export Default API Object
================================================= */

const agentApi = {
  getAgents,

  getAgent,

  createAgent,

  updateAgent,

  replaceAgent,

  deleteAgent,

  startAgent,

  stopAgent,

  pauseAgent,

  resumeAgent,

  restartAgent,

  getAgentHealth,

  getAgentMetrics,

  getAgentLogs,

  searchAgents,

  filterAgents,

  bulkStartAgents,

  bulkStopAgents,
};

export default agentApi;