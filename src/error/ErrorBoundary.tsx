export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
}

export class ErrorHandler {
  public handle(
    error: unknown
  ): ErrorResponse {
    let message =
      "An unexpected error occurred.";

    let statusCode = 500;

    if (error instanceof Error) {
      message = error.message;
    }

    if (
      typeof error === "object" &&
      error !== null
    ) {
      const errorObject =
        error as {
          message?: string;
          statusCode?: number;
          status?: number;
        };

      if (errorObject.message) {
        message = errorObject.message;
      }

      if (errorObject.statusCode) {
        statusCode =
          errorObject.statusCode;
      } else if (errorObject.status) {
        statusCode =
          errorObject.status;
      }
    }

    console.error(
      "Application Error:",
      error
    );

    return {
      success: false,
      message,
      statusCode,
      timestamp:
        new Date().toISOString(),
    };
  }

  public isClientError(
    statusCode: number
  ): boolean {
    return (
      statusCode >= 400 &&
      statusCode < 500
    );
  }

  public isServerError(
    statusCode: number
  ): boolean {
    return statusCode >= 500;
  }

  public getMessage(
    error: unknown
  ): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (
      typeof error === "string"
    ) {
      return error;
    }

    return "An unexpected error occurred.";
  }
}

const errorHandler =
  new ErrorHandler();

export default errorHandler;