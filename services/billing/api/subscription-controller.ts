import type {
    Subscription
} from "../models.js";
import { SubscriptionService } from "../services/subscription-service.js";

export class SubscriptionController {
    constructor(
        private readonly service:
            SubscriptionService
    ) {}

    create(
        customerId: string,
        planId: string,
        quantity = 1
    ): Subscription {
        return this.service.create(
            customerId,
            planId,
            quantity
        );
    }

    get(id: string): Subscription {
        return this.service.get(id);
    }

    cancel(
        id: string,
        immediately = false
    ): Subscription {
        return this.service.cancel(
            id,
            immediately
        );
    }

    pause(id: string): Subscription {
        return this.service.pause(id);
    }

    resume(id: string): Subscription {
        return this.service.resume(id);
    }

    renew(id: string): Subscription {
        return this.service.renew(id);
    }
}
