import type {
  Request,
  RequestHandler,
  Response,
} from "express";

export type ControllerRequestSource = "body" | "query" | "params";

export interface ControllerValidationIssue {
  readonly path: readonly (string | number)[];
  readonly code: string;
  readonly message: string;
}

export type ControllerParseResult =
  | {
      readonly success: true;
      readonly data: unknown;
    }
  | {
      readonly success: false;
      readonly error: {
        readonly issues: readonly ControllerValidationIssue[];
      };
    };

export interface ControllerSchema {
  safeParse(input: unknown): ControllerParseResult;
}

export interface ControllerOperation {
  readonly schema: ControllerSchema;
  readonly source: ControllerRequestSource;
  readonly execute: (
    input: unknown,
    request: Request,
  ) => unknown | Promise<unknown>;
  readonly successStatus?: number;
}

export type ControllerOperations =
  Readonly<Record<string, ControllerOperation>>;

function requestInput(
  request: Request,
  source: ControllerRequestSource,
): unknown {
  switch (source) {
    case "body":
      return request.body;
    case "query":
      return request.query;
    case "params":
      return request.params;
    default:
      throw new TypeError("Unsupported controller request source.");
  }
}

function requestId(response: Response): string | undefined {
  const value: unknown = response.locals.requestId;
  return typeof value === "string" ? value : undefined;
}

function validateOperation(
  domain: string,
  name: string,
  operation: ControllerOperation,
): void {
  if (!name.trim()) {
    throw new TypeError(
      `Controller operation name must not be empty for ${domain}.`,
    );
  }

  if (
    !operation ||
    typeof operation !== "object" ||
    !operation.schema ||
    typeof operation.schema.safeParse !== "function" ||
    typeof operation.execute !== "function"
  ) {
    throw new TypeError(
      `Invalid controller operation "${name}" configured for ${domain}.`,
    );
  }

  if (
    !["body", "query", "params"].includes(operation.source)
  ) {
    throw new TypeError(
      `Invalid request source for ${domain}.${name}.`,
    );
  }

  const status = operation.successStatus;
  if (
    status !== undefined &&
    (!Number.isInteger(status) || status < 200 || status > 299)
  ) {
    throw new TypeError(
      `Invalid success status for ${domain}.${name}.`,
    );
  }
}

/**
 * Shared HTTP mechanics only.
 * Every operation must supply its real domain service implementation.
 */
export function createDomainControllers(
  domain: string,
  operations: ControllerOperations,
): Readonly<Record<string, RequestHandler>> {
  if (typeof domain !== "string" || !domain.trim()) {
    throw new TypeError(
      "Controller domain must be a non-empty string.",
    );
  }

  if (
    !operations ||
    typeof operations !== "object" ||
    Array.isArray(operations)
  ) {
    throw new TypeError(
      `Controller operations must be an object for ${domain}.`,
    );
  }

  const entries = Object.entries(operations);

  if (entries.length === 0) {
    throw new TypeError(
      `At least one operation must be configured for ${domain}.`,
    );
  }

  const handlers: Record<string, RequestHandler> =
    Object.create(null) as Record<string, RequestHandler>;

  for (const [name, operation] of entries) {
    if (
      name === "__proto__" ||
      name === "prototype" ||
      name === "constructor"
    ) {
      throw new TypeError(
        `Unsafe controller operation name for ${domain}.`,
      );
    }

    validateOperation(domain, name, operation);

    handlers[name] = async (request, response, next) => {
      try {
        const parsed = operation.schema.safeParse(
          requestInput(request, operation.source),
        );

        if (!parsed.success) {
          response.status(400).json({
            error: {
              code: "VALIDATION_ERROR",
              message: "The request contains invalid fields.",
              details: parsed.error.issues,
            },
            requestId: requestId(response),
          });
          return;
        }

        const data = await operation.execute(
          parsed.data,
          request,
        );

        if (response.headersSent) {
          return;
        }

        response.status(operation.successStatus ?? 200).json({
          data,
          requestId: requestId(response),
        });
      } catch (error: unknown) {
        if (response.headersSent) {
          return;
        }

        next(error);
      }
    };
  }

  return Object.freeze(handlers);
}
