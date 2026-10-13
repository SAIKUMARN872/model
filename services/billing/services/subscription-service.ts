import type {
    Subscription
} from "../models.js";
import {
    SubscriptionManager
} from "../subscriptions/manager.js";
import { PlanCatalog } from "../plans/catalog.js";

export class SubscriptionService {
    constructor(
        private readonly subscriptions:
            SubscriptionManager,
        private readonly plans:
            PlanCatalog
    ) {}

    create(
        customerId: string,
        planId: string,
        quantity = 1
    ): Subscription {
        return this.subscriptions.create(
            customerId,
            this.plans.get(planId),
            quantity
        );
    }

    get(id: string): Subscription {
        return this.subscriptions.get(id);
    }

    cancel(
        id: string,
        immediately = false
    ): Subscription {
        return this.subscriptions.cancel(
            id,
            immediately
        );
    }

    pause(id: string): Subscription {
        return this.subscriptions.pause(id);
    }

    resume(id: string): Subscription {
        return this.subscriptions.resume(id);
    }

    renew(id: string): Subscription {
        const subscription =
            this.subscriptions.get(id);

        const plan =
            this.plans.get(
                subscription.planId
            );

        return this.subscriptions.renew(
            id,
            plan
        );
    }
}
