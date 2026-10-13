import type {
  GatewayResponse,
} from "./request_handler.js";

export function jsonResponse(
  body: unknown,
  statusCode = 200,
): GatewayResponse {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
    },
    body,
  };
}

export function errorResponse(
  message: string,
  statusCode = 500,
): GatewayResponse {
  return jsonResponse(
    {
      error: message,
    },
    statusCode,
  );
}
