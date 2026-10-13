import type {
    Subscription
} from "../models.js";
import {
    SubscriptionManager
} from "../subscriptions/manager.js";

export class SubscriptionRepository {
    constructor(
        private readonly manager:
            SubscriptionManager
    ) {}

    findById(
        id: string
    ): Subscription {
        return this.manager.get(id);
    }

    findByCustomer(
        customerId: string
    ): Subscription[] {
        return this.manager.listByCustomer(
            customerId
        );
    }
}
