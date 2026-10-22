import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/api.error.js";
import { API_ERROR_CODES } from "../errors/error-codes.js";
import { ValidationError } from "../errors/validation.error.js";
import { logger } from "../config/logging.js";

type ParserError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
};

function hasParserType(
  error: unknown,
  type: string,
): error is ParserError {
  return (
    error instanceof Error &&
    (error as ParserError).type === type
  );
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestId: unknown = res.locals.requestId;
  let statusCode = 500;
  let code: string = API_ERROR_CODES.INTERNAL_ERROR;
  let message = "An unexpected error occurred.";

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (
    error instanceof SyntaxError &&
    hasParserType(error, "entity.parse.failed")
  ) {
    statusCode = 400;
    code = API_ERROR_CODES.BAD_REQUEST;
    message = "The request body contains invalid JSON.";
  } else if (hasParserType(error, "entity.too.large")) {
    statusCode = 413;
    code = API_ERROR_CODES.PAYLOAD_TOO_LARGE;
    message = "The request body is too large.";
  } else {
    logger.error("Unhandled API request error", {
      requestId,
      method: req.method,
      path: req.path,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
  }

  const responseError: {
    code: string;
    message: string;
    issues?: ValidationError["issues"];
  } = { code, message };

  if (error instanceof ValidationError) {
    responseError.issues = error.issues;
  }

  res.status(statusCode).json({
    success: false,
    error: responseError,
    requestId,
  });
};
