import { EventEmitter } from "node:events";
import type { Account } from "../schemas/account-schema.js";
import type { Profile } from "../schemas/profile-schema.js";

export type AccountEventName =
  | "account.created"
  | "account.updated"
  | "account.deleted"
  | "profile.updated";

export interface AccountEvent<T = unknown> {
  id: string;
  type: AccountEventName;
  timestamp: string;
  data: T;
}

export class AccountEventBus {
  private readonly emitter = new EventEmitter();

  publish<T>(
    type: AccountEventName,
    data: T,
  ): AccountEvent<T> {
    const event: AccountEvent<T> = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    this.emitter.emit(type, event);
    this.emitter.emit("*", event);

    return event;
  }

  subscribe(
    listener: (event: AccountEvent) => void,
  ): () => void {
    this.emitter.on("*", listener);

    return () => {
      this.emitter.off("*", listener);
    };
  }
}

export type AccountCreatedEvent = AccountEvent<Account>;
export type AccountUpdatedEvent = AccountEvent<Account>;
export type ProfileUpdatedEvent = AccountEvent<Profile>;
