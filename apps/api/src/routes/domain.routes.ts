import { Router } from "express";
import type { RequestHandler } from "express";

export interface DomainRouteDefinition {
  readonly method: "get" | "post" | "put" | "patch" | "delete";
  readonly path: string;
  readonly handler: RequestHandler;
}

const ALLOWED_METHODS = new Set<string>([
  "get",
  "post",
  "put",
  "patch",
  "delete",
]);

function validateDefinition(
  definition: DomainRouteDefinition,
  index: number,
  seen: Set<string>,
): void {
  if (typeof definition !== "object" || definition === null) {
    throw new TypeError(`Invalid domain route definition at index ${index}.`);
  }

  if (!ALLOWED_METHODS.has(definition.method)) {
    throw new TypeError(`Unsupported HTTP method at route index ${index}.`);
  }

  if (
    typeof definition.path !== "string" ||
    !definition.path.startsWith("/") ||
    definition.path.startsWith("//") ||
    definition.path.includes("?") ||
    definition.path.includes("#") ||
    definition.path.includes("\\") ||
    definition.path.split("/").some(
      (segment) => segment === "." || segment === "..",
    )
  ) {
    throw new TypeError(`Invalid domain route path at index ${index}.`);
  }

  if (typeof definition.handler !== "function") {
    throw new TypeError(`Invalid domain route handler at index ${index}.`);
  }

  const key = `${definition.method} ${definition.path}`;

  if (seen.has(key)) {
    throw new TypeError(`Duplicate domain route: ${key}.`);
  }

  seen.add(key);
}

export function createProtectedDomainRoutes(
  authenticate: RequestHandler,
  definitions: readonly DomainRouteDefinition[],
): Router {
  if (typeof authenticate !== "function") {
    throw new TypeError("A valid authentication middleware is required.");
  }

  if (!Array.isArray(definitions) || definitions.length === 0) {
    throw new TypeError("At least one domain route must be configured.");
  }

  const seen = new Set<string>();

  definitions.forEach((definition, index) => {
    validateDefinition(definition, index, seen);
  });

  const router = Router();
  router.use(authenticate);

  for (const definition of definitions) {
    switch (definition.method) {
      case "get":
        router.get(definition.path, definition.handler);
        break;
      case "post":
        router.post(definition.path, definition.handler);
        break;
      case "put":
        router.put(definition.path, definition.handler);
        break;
      case "patch":
        router.patch(definition.path, definition.handler);
        break;
      case "delete":
        router.delete(definition.path, definition.handler);
        break;
    }
  }

  return router;
}
