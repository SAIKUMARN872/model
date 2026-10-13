import { SubscriptionManager } from "./manager.js";

export class SubscriptionCancellation {
    constructor(
        private readonly manager:
            SubscriptionManager
    ) {}

    cancel(
        id: string,
        immediately = false
    ) {
        return this.manager.cancel(
            id,
            immediately
        );
    }
}
