export type AccountEventType =
    | "account.created"
    | "account.updated"
    | "account.deleted"
    | "login.success"
    | "login.failure"

export interface AccountEvent {
    type: AccountEventType
    userId?: string
    email?: string
    timestamp: Date
    data?: Record<string, unknown>
}

export class AccountEventService {
    private readonly events: AccountEvent[] = []

    publish(event: AccountEvent): AccountEvent {
        this.events.push(event)
        return event
    }

    emit(
        type: AccountEventType,
        data: Omit<AccountEvent, "type" | "timestamp"> = {}
    ): AccountEvent {
        const event: AccountEvent = {
            type,
            timestamp: new Date(),
            ...data
        }

        return this.publish(event)
    }

    list(): AccountEvent[] {
        return [...this.events]
    }

    clear(): void {
        this.events.length = 0
    }
}
