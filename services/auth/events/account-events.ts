import { randomUUID } from "node:crypto";

export type AccountEventType =
  | "account.created"
  | "account.updated"
  | "account.activated"
  | "account.deactivated"
  | "account.locked"
  | "account.suspended"
  | "account.email_verified"
  | "account.phone_verified"
  | "account.activity_recorded"
  | "account.deleted";

export interface AccountEvent {
  id: string;
  type: AccountEventType;
  accountId: string;
  userId: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface CreateAccountEventInput {
  type: AccountEventType;
  accountId: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface AccountEventFilter {
  type?: AccountEventType;
  accountId?: string;
  userId?: string;
  from?: Date;
  to?: Date;
}

export interface AccountEventHealth {
  healthy: boolean;
  totalEvents: number;
  supportedEventTypes: number;
}

function cloneEvent(event: AccountEvent): AccountEvent {
  return {
    ...event,
    timestamp: new Date(event.timestamp),
    metadata: { ...event.metadata },
  };
}

export class AccountEventService {
  private readonly events: AccountEvent[] = [];

  emit(input: CreateAccountEventInput): AccountEvent {
    if (!input.accountId?.trim()) {
      throw new Error("Account ID is required");
    }

    if (!input.userId?.trim()) {
      throw new Error("User ID is required");
    }

    const event: AccountEvent = {
      id: randomUUID(),
      type: input.type,
      accountId: input.accountId,
      userId: input.userId,
      timestamp: new Date(),
      metadata: {
        ...(input.metadata ?? {}),
      },
    };

    this.events.push(event);

    return cloneEvent(event);
  }

  get(id: string): AccountEvent | undefined {
    const event = this.events.find(
      (item) => item.id === id,
    );

    return event ? cloneEvent(event) : undefined;
  }

  getRequired(id: string): AccountEvent {
    const event = this.get(id);

    if (!event) {
      throw new Error(`Account event not found: ${id}`);
    }

    return event;
  }

  list(filter: AccountEventFilter = {}): AccountEvent[] {
    return this.events
      .filter((event) => {
        if (
          filter.type !== undefined &&
          event.type !== filter.type
        ) {
          return false;
        }

        if (
          filter.accountId !== undefined &&
          event.accountId !== filter.accountId
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
          filter.from !== undefined &&
          event.timestamp < filter.from
        ) {
          return false;
        }

        if (
          filter.to !== undefined &&
          event.timestamp > filter.to
        ) {
          return false;
        }

        return true;
      })
      .map(cloneEvent);
  }

  getByAccountId(accountId: string): AccountEvent[] {
    return this.list({ accountId });
  }

  getByUserId(userId: string): AccountEvent[] {
    return this.list({ userId });
  }

  getByType(type: AccountEventType): AccountEvent[] {
    return this.list({ type });
  }

  count(): number {
    return this.events.length;
  }

  countByType(type: AccountEventType): number {
    return this.events.filter(
      (event) => event.type === type,
    ).length;
  }

  latest(): AccountEvent | undefined {
    const event = this.events[this.events.length - 1];

    return event ? cloneEvent(event) : undefined;
  }

  clear(): void {
    this.events.length = 0;
  }

  health(): AccountEventHealth {
    return {
      healthy: true,
      totalEvents: this.events.length,
      supportedEventTypes: 10,
    };
  }
}

export const accountEventService =
  new AccountEventService();
