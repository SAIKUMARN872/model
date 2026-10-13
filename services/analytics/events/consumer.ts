import { AnalyticsEventMessage } from "./events.js";

export class AnalyticsEventConsumer {
  private readonly handlers =
    new Map<string, Array<(event: AnalyticsEventMessage) => void>>();

  subscribe(
    type: string,
    handler: (event: AnalyticsEventMessage) => void,
  ): () => void {
    const handlers = this.handlers.get(type) ?? [];
    handlers.push(handler);
    this.handlers.set(type, handlers);

    return () => {
      const current = this.handlers.get(type) ?? [];
      this.handlers.set(
        type,
        current.filter((item) => item !== handler),
      );
    };
  }

  publish(event: AnalyticsEventMessage): void {
    const handlers = this.handlers.get(event.type) ?? [];

    for (const handler of handlers) {
      handler(event);
    }
  }
}
