import type {
  GatewayRequest,
  GatewayResponse,
} from "../handlers/request_handler.js";
import type {
  Forwarder,
} from "./forwarder.js";

export class Proxy {
  constructor(
    private readonly forwarder: Forwarder,
  ) {}

  async forward(
    request: GatewayRequest,
    target: string,
  ): Promise<GatewayResponse> {
    if (!target.trim()) {
      throw new Error("Proxy target is required");
    }

    return this.forwarder.forward(
      request,
      target,
    );
  }
}
