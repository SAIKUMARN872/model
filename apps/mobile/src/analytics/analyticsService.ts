export interface AnalyticsEvent {
  id: string;
  name: string;
  userId?: string;
  timestamp: string;
  properties?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventTypes: number;
  firstEvent?: string;
  lastEvent?: string;
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  public track(
    name: string,
    userId?: string,
    properties?: Record<string, unknown>
  ): AnalyticsEvent {
    if (!name.trim()) {
      throw new Error("Analytics event name is required.");
    }

    const event: AnalyticsEvent = {
      id: this.generateId(),
      name,
      userId,
      timestamp: new Date().toISOString(),
      properties,
    };

    this.events.push(event);

    return event;
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public getEventsByName(
    name: string
  ): AnalyticsEvent[] {
    return this.events.filter(
      (event) => event.name === name
    );
  }

  public getEventsByUser(
    userId: string
  ): AnalyticsEvent[] {
    return this.events.filter(
      (event) => event.userId === userId
    );
  }

  public getSummary(): AnalyticsSummary {
    const uniqueUsers = new Set(
      this.events
        .map((event) => event.userId)
        .filter(Boolean)
    );

    const eventTypes = new Set(
      this.events.map((event) => event.name)
    );

    const timestamps = this.events.map(
      (event) => event.timestamp
    );

    return {
      totalEvents: this.events.length,
      uniqueUsers: uniqueUsers.size,
      eventTypes: eventTypes.size,
      firstEvent:
        timestamps.length > 0
          ? timestamps[0]
          : undefined,
      lastEvent:
        timestamps.length > 0
          ? timestamps[timestamps.length - 1]
          : undefined,
    };
  }

  public count(): number {
    return this.events.length;
  }

  public clear(): void {
    this.events = [];
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;