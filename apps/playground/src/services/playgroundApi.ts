
export interface PlaygroundRunRequest {
  input: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: unknown;
}

export interface PlaygroundRunResponse {
  id?: string;
  output?: string;
  content?: string;
  response?: string;
  model?: string;
  tokens?: number;
  cost?: number;
  latency?: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  data?: unknown;
  choices?: Array<{
    message?: {
      content?: string;
    };
    text?: string;
  }>;
  [key: string]: unknown;
}

export interface PlaygroundHistoryParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface PlaygroundComparisonRequest {
  [key: string]: unknown;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api"
).replace(/\/+$/, "");

/**
 * Central API request handler.
 */
async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

/**
 * Extract data from the backend ApiResponse envelope.
 */
function extractApiData<T>(response: ApiResponse<T>): T {
  if (!response || !("data" in response)) {
    throw new Error("The backend returned an invalid API response.");
  }

  return response.data as T;
}

/**
 * Chat Playground.
 */
export async function runPlayground(
  playgroundData: PlaygroundRunRequest
): Promise<PlaygroundRunResponse> {
  if (!playgroundData?.input?.trim()) {
    throw new Error("Playground input is required.");
  }

  return request<PlaygroundRunResponse>(
    "/playground/chat",
    {
      method: "POST",
      body: JSON.stringify(playgroundData),
    }
  );
}

/**
 * Test a selected model through the existing chat endpoint.
 */
export async function testPlayground(
  playgroundData: PlaygroundRunRequest
): Promise<PlaygroundRunResponse> {
  if (!playgroundData?.input?.trim()) {
    throw new Error("A test prompt is required.");
  }

  return runPlayground(playgroundData);
}

/**
 * Retrieve backend-confirmed model IDs.
 * Backend route: GET /playground/models
 */
export async function getAvailableModels(): Promise<string[]> {
  const response = await request<ApiResponse<string[]>>(
    "/playground/models"
  );

  const models = extractApiData(response);

  if (!Array.isArray(models)) {
    throw new Error("The backend returned an invalid model catalogue.");
  }

  return models;
}

/**
 * Retrieve backend-confirmed provider names.
 * Backend route: GET /playground/providers
 */
export async function getAvailableProviders(): Promise<string[]> {
  const response = await request<ApiResponse<string[]>>(
    "/playground/providers"
  );

  const providers = extractApiData(response);

  if (!Array.isArray(providers)) {
    throw new Error("The backend returned an invalid provider list.");
  }

  return providers;
}

/**
 * Retrieve playground history.
 */
export async function getPlaygroundHistory(
  params: PlaygroundHistoryParams = {}
): Promise<unknown> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();

  return request(
    `/playground/history${queryString ? `?${queryString}` : ""}`
  );
}

/**
 * Retrieve a specific playground run.
 */
export async function getPlaygroundRun(
  id: string | number
): Promise<unknown> {
  if (!id) {
    throw new Error("Playground run ID is required.");
  }

  return request(`/playground/runs/${encodeURIComponent(String(id))}`);
}

/**
 * Delete a playground run.
 */
export async function deletePlaygroundRun(
  id: string | number
): Promise<unknown> {
  if (!id) {
    throw new Error("Playground run ID is required.");
  }

  return request(
    `/playground/runs/${encodeURIComponent(String(id))}`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Compare playground model responses.
 */
export async function comparePlayground(
  comparisonData: PlaygroundComparisonRequest
): Promise<unknown> {
  if (!comparisonData) {
    throw new Error("Comparison data is required.");
  }

  return request("/playground/compare", {
    method: "POST",
    body: JSON.stringify(comparisonData),
  });
}

/**
 * Clear playground conversation.
 */
export async function clearPlayground(): Promise<unknown> {
  return request("/playground/clear", {
    method: "POST",
  });
}

const playgroundApi = {
  runPlayground,
  testPlayground,
  getAvailableModels,
  getAvailableProviders,
  getPlaygroundHistory,
  getPlaygroundRun,
  deletePlaygroundRun,
  comparePlayground,
  clearPlayground,
};

export default playgroundApi;
