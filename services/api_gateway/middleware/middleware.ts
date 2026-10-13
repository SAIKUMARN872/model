import type {
  GatewayContext,
  GatewayResponse,
} from "../handlers/request_handler.js";

export type MiddlewareNext = () => Promise<GatewayResponse>;

export type Middleware = (
  context: GatewayContext,
  next: MiddlewareNext,
) => Promise<GatewayResponse>;
