// services/analytics/events/consumer.ts

import {
  cloneEvent,
  createAnalyticsEvent,
  createRandomId,
  type AnalyticsEvent,
  type CreateEventInput,
  type EventFilter,
} from "./events.js";

export interface EventConsumerOptions {
  maxEvents?: number;
}

export interface EventConsumerHealth {
  healthy: boolean;
  running: boolean;
  eventCount: number;
  consumerCount: number;
}

export type EventHandler = (
  event: AnalyticsEvent,
) => void | Promise<void>;

interface RegisteredConsumer {
  id: string;
  handler: EventHandler;
  filter?: EventFilter;
}

function matchesFilter(
  event: AnalyticsEvent,
  filter: EventFilter,
): boolean {
  if (
    filter.organizationId !== undefined &&
    event.organizationId !==
      filter.organizationId
  ) {
    return false;
  }

  if (
    filter.type !== undefined &&
    event.type !== filter.type
  ) {
    return false;
  }

  if (
    filter.severity !== undefined &&
    event.severity !== filter.severity
  ) {
    return false;
  }

  if (
    filter.source !== undefined &&
    event.source !== filter.source
  ) {
    return false;
  }

  if (
    filter.requestId !== undefined &&
    event.requestId !== filter.requestId
  ) {
    return false;
  }

  if (
    filter.userId !== undefined &&
    event.userId !== filter.userId
  ) {
    return false;
  }

  if (
    filter.provider !== undefined &&
    event.provider !== filter.provider
  ) {
    return false;
  }

  if (
    filter.model !== undefined &&
    event.model !== filter.model
  ) {
    return false;
  }

  if (
    filter.startTime !== undefined &&
    Date.parse(event.timestamp) <
      Date.parse(filter.startTime)
  ) {
    return false;
  }

  if (
    filter.endTime !== undefined &&
    Date.parse(event.timestamp) >
      Date.parse(filter.endTime)
  ) {
    return false;
  }

  return true;
}

export class EventConsumer {
  private readonly events: AnalyticsEvent[] =
    [];

  private readonly consumers =
    new Map<string, RegisteredConsumer>();

  private readonly maxEvents: number;

  private running = false;

  constructor(
    options: EventConsumerOptions = {},
  ) {
    this.maxEvents =
      options.maxEvents ?? 10000;

    if (
      !Number.isInteger(this.maxEvents) ||
      this.maxEvents <= 0
    ) {
      throw new Error(
        "maxEvents must be a positive integer",
      );
    }
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  register(
    handler: EventHandler,
    filter?: EventFilter,
  ): string {
    if (typeof handler !== "function") {
      throw new Error(
        "Event handler must be a function",
      );
    }

    const id =
      `consumer_${createRandomId()}`;

    this.consumers.set(id, {
      id,
      handler,
      filter,
    });

    return id;
  }

  unregister(
    consumerId: string,
  ): boolean {
    if (
      !consumerId ||
      consumerId.trim().length === 0
    ) {
      throw new Error(
        "Consumer ID cannot be empty",
      );
    }

    return this.consumers.delete(
      consumerId,
    );
  }

  consumerCount(): number {
    return this.consumers.size;
  }

  async publish(
    input: CreateEventInput,
  ): Promise<AnalyticsEvent> {
    if (!this.running) {
      throw new Error(
        "Event consumer is not running",
      );
    }

    const event =
      createAnalyticsEvent(input);

    this.store(event);

    for (const consumer of this.consumers.values()) {
      if (
        consumer.filter !== undefined &&
        !matchesFilter(
          event,
          consumer.filter,
        )
      ) {
        continue;
      }

      await consumer.handler(
        cloneEvent(event),
      );
    }

    return cloneEvent(event);
  }

  getEvents(
    filter: EventFilter = {},
  ): AnalyticsEvent[] {
    return this.events
      .filter((event) =>
        matchesFilter(event, filter),
      )
      .map(cloneEvent);
  }

  getEvent(
    eventId: string,
  ): AnalyticsEvent | undefined {
    if (
      !eventId ||
      eventId.trim().length === 0
    ) {
      throw new Error(
        "Event ID cannot be empty",
      );
    }

    const event =
      this.events.find(
        (item) => item.id === eventId,
      );

    return event
      ? cloneEvent(event)
      : undefined;
  }

  clear(): void {
    this.events.length = 0;
  }

  size(): number {
    return this.events.length;
  }

  health(): EventConsumerHealth {
    return {
      healthy:
        this.running &&
        this.events.length <=
          this.maxEvents,
      running: this.running,
      eventCount: this.events.length,
      consumerCount:
        this.consumers.size,
    };
  }

  private store(
    event: AnalyticsEvent,
  ): void {
    this.events.push(
      cloneEvent(event),
    );

    while (
      this.events.length >
      this.maxEvents
    ) {
      this.events.shift();
    }
  }
}