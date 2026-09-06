export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });

    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        success: false,
        message:
          typeof data === "object" &&
          data !== null &&
          "message" in data
            ? String(
                (data as {
                  message?: unknown;
                }).message
              )
            : "Request failed.",
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data as T,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network request failed.",
    };
  }
}

export function get<T>(
  url: string,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "GET",
    headers,
  });
}

export function post<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "POST",
    body,
    headers,
  });
}

export function put<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "PUT",
    body,
    headers,
  });
}

export function patch<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "PATCH",
    body,
    headers,
  });
}

export function remove<T>(
  url: string,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "DELETE",
    headers,
  });
}