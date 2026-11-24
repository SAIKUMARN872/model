export class AppError extends Error {
  status?: number;

  constructor(
    message: string,
    status?: number
  ) {
    super(message);

    this.name = "AppError";
    this.status = status;
  }
}

export const getErrorMessage = (
  error: unknown
): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export const isAppError = (
  error: unknown
): error is AppError => {
  return error instanceof AppError;
};