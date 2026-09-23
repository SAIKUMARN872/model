export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error: {
    code: string;
    details?: unknown;
  } | null;
  requestId?: string;
  timestamp: string;
}

export interface ResponseOptions {
  requestId?: string;
}

export class ResponseHandler {
  success<T>(
    data: T,
    message = "Request successful",
    statusCode = 200,
    options: ResponseOptions = {},
  ): ApiResponse<T> {
    this.validateStatusCode(statusCode);

    return {
      success: true,
      statusCode,
      message,
      data,
      error: null,
      requestId: options.requestId,
      timestamp: new Date().toISOString(),
    };
  }

  created<T>(
    data: T,
    message = "Resource created successfully",
    options: ResponseOptions = {},
  ): ApiResponse<T> {
    return this.success(
      data,
      message,
      201,
      options,
    );
  }

  noContent(
    message = "Request completed successfully",
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.success(
      null,
      message,
      204,
      options,
    );
  }

  error(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    this.validateStatusCode(statusCode);

    if (!code.trim()) {
      throw new Error("Error code is required.");
    }

    if (!message.trim()) {
      throw new Error("Error message is required.");
    }

    return {
      success: false,
      statusCode,
      message,
      data: null,
      error: {
        code,
        ...(details !== undefined ? { details } : {}),
      },
      requestId: options.requestId,
      timestamp: new Date().toISOString(),
    };
  }

  badRequest(
    message = "Bad request",
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.error(
      400,
      "BAD_REQUEST",
      message,
      details,
      options,
    );
  }

  unauthorized(
    message = "Authentication required",
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.error(
      401,
      "UNAUTHORIZED",
      message,
      details,
      options,
    );
  }

  forbidden(
    message = "Access denied",
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.error(
      403,
      "FORBIDDEN",
      message,
      details,
      options,
    );
  }

  notFound(
    message = "Resource not found",
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.error(
      404,
      "NOT_FOUND",
      message,
      details,
      options,
    );
  }

  conflict(
    message = "Resource conflict",
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.error(
      409,
      "CONFLICT",
      message,
      details,
      options,
    );
  }

  tooManyRequests(
    message = "Too many requests",
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.error(
      429,
      "RATE_LIMIT_EXCEEDED",
      message,
      details,
      options,
    );
  }

  internalServerError(
    message = "Internal server error",
    details?: unknown,
    options: ResponseOptions = {},
  ): ApiResponse<null> {
    return this.error(
      500,
      "INTERNAL_SERVER_ERROR",
      message,
      details,
      options,
    );
  }

  private validateStatusCode(statusCode: number): void {
    if (
      !Number.isInteger(statusCode) ||
      statusCode < 100 ||
      statusCode > 599
    ) {
      throw new Error(
        `Invalid HTTP status code: ${statusCode}`,
      );
    }
  }

  health(): {
    status: "ok";
    component: string;
  } {
    return {
      status: "ok",
      component: "response-handler",
    };
  }
}