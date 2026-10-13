import type {
  GatewayRequest,
  GatewayResponse,
} from "../handlers/request_handler.js";

export interface Forwarder {
  forward(
    request: GatewayRequest,
    target: string,
  ): Promise<GatewayResponse>;
}
