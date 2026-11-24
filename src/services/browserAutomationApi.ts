import { apiClient } from "./api/client";

export const BROWSER_AUTOMATION_ENDPOINTS = {
  create: "/browser-automation/tasks",

  status: (taskId: string) =>
    `/browser-automation/tasks/${taskId}`,

  pause: (taskId: string) =>
    `/browser-automation/tasks/${taskId}/pause`,

  resume: (taskId: string) =>
    `/browser-automation/tasks/${taskId}/resume`,

  stop: (taskId: string) =>
    `/browser-automation/tasks/${taskId}/stop`,

  approve: (taskId: string) =>
    `/browser-automation/tasks/${taskId}/approve`,

  cancel: (taskId: string) =>
    `/browser-automation/tasks/${taskId}/cancel`,
};

export type CreateBrowserAutomationPayload = {
  task: string;
  connector?: string | null;
};

export type CreateBrowserAutomationResponse = {
  taskId: string;
  status: string;
};

export type BrowserAutomationStatusResponse = {
  taskId: string;
  status: string;
  currentStep?: number;
  message?: string;
  result?: unknown;
};

async function getRequest<T>(endpoint: string): Promise<T> {
  return apiClient(endpoint, {
    method: "GET",
  }) as Promise<T>;
}

async function postRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiClient(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as Promise<T>;
}

export async function createBrowserAutomationTask(
  payload: CreateBrowserAutomationPayload
): Promise<CreateBrowserAutomationResponse> {
  return postRequest<CreateBrowserAutomationResponse>(
    BROWSER_AUTOMATION_ENDPOINTS.create,
    payload
  );
}

export async function getBrowserAutomationStatus(
  taskId: string
): Promise<BrowserAutomationStatusResponse> {
  return getRequest<BrowserAutomationStatusResponse>(
    BROWSER_AUTOMATION_ENDPOINTS.status(taskId)
  );
}

export async function pauseBrowserAutomation(
  taskId: string
): Promise<unknown> {
  return postRequest(
    BROWSER_AUTOMATION_ENDPOINTS.pause(taskId)
  );
}

export async function resumeBrowserAutomation(
  taskId: string
): Promise<unknown> {
  return postRequest(
    BROWSER_AUTOMATION_ENDPOINTS.resume(taskId)
  );
}

export async function stopBrowserAutomation(
  taskId: string
): Promise<unknown> {
  return postRequest(
    BROWSER_AUTOMATION_ENDPOINTS.stop(taskId)
  );
}

export async function approveBrowserAutomation(
  taskId: string
): Promise<unknown> {
  return postRequest(
    BROWSER_AUTOMATION_ENDPOINTS.approve(taskId)
  );
}

export async function cancelBrowserAutomation(
  taskId: string
): Promise<unknown> {
  return postRequest(
    BROWSER_AUTOMATION_ENDPOINTS.cancel(taskId)
  );
}