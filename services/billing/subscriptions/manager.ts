import { randomUUID } from "node:crypto";
import type {
    Plan,
    Subscription
} from "../models.js";
import {
    NotFoundException,
    ValidationException
} from "../exceptions.js";
import {
    addBillingInterval,
    clone
} from "../utils.js";

export class SubscriptionManager {
    private readonly subscriptions =
        new Map<
            string,
            Subscription
        >();

    create(
        customerId: string,
        plan: Plan,
        quantity = 1
    ): Subscription {
        if (!plan.active) {
            throw new ValidationException(
                "Plan is inactive"
            );
        }

        if (quantity <= 0) {
            throw new ValidationException(
                "Quantity must be positive"
            );
        }

        const now = new Date();

        const trialEnd =
            plan.trialDays > 0
                ? new Date(
                      now.getTime() +
                          plan.trialDays *
                              86400000
                  )
                : undefined;

        const subscription: Subscription = {
            id: randomUUID(),
            customerId,
            planId: plan.id,
            status:
                trialEnd
                    ? "trialing"
                    : "active",
            currentPeriodStart:
                now,
            currentPeriodEnd:
                addBillingInterval(
                    now,
                    plan.interval
                ),
            trialEnd,
            cancelAtPeriodEnd: false,
            quantity,
            metadata: {},
            createdAt: now,
            updatedAt: now
        };

        this.subscriptions.set(
            subscription.id,
            subscription
        );

        return clone(subscription);
    }

    get(
        id: string
    ): Subscription {
        const subscription =
            this.subscriptions.get(id);

        if (!subscription) {
            throw new NotFoundException(
                "Subscription",
                id
            );
        }

        return clone(subscription);
    }

    listByCustomer(
        customerId: string
    ): Subscription[] {
        return [
            ...this.subscriptions.values()
        ]
            .filter(
                (item) =>
                    item.customerId ===
                    customerId
            )
            .map(clone);
    }

    cancel(
        id: string,
        immediately = false
    ): Subscription {
        const subscription =
            this.get(id);

        if (immediately) {
            subscription.status =
                "canceled";

            subscription.canceledAt =
                new Date();
        } else {
            subscription.cancelAtPeriodEnd =
                true;
        }

        subscription.updatedAt =
            new Date();

        this.subscriptions.set(
            id,
            subscription
        );

        return clone(subscription);
    }

    pause(
        id: string
    ): Subscription {
        const subscription =
            this.get(id);

        if (
            subscription.status ===
            "canceled"
        ) {
            throw new ValidationException(
                "Canceled subscription cannot be paused"
            );
        }

        subscription.status =
            "paused";

        subscription.updatedAt =
            new Date();

        this.subscriptions.set(
            id,
            subscription
        );

        return clone(subscription);
    }

    resume(
        id: string
    ): Subscription {
        const subscription =
            this.get(id);

        if (
            subscription.status ===
            "canceled"
        ) {
            throw new ValidationException(
                "Canceled subscription cannot be resumed"
            );
        }

        subscription.status =
            "active";

        subscription.updatedAt =
            new Date();

        this.subscriptions.set(
            id,
            subscription
        );

        return clone(subscription);
    }

    renew(
        id: string,
        plan: Plan
    ): Subscription {
        const subscription =
            this.get(id);

        if (
            subscription.status ===
            "canceled"
        ) {
            throw new ValidationException(
                "Canceled subscription cannot be renewed"
            );
        }

        subscription.currentPeriodStart =
            new Date(
                subscription.currentPeriodEnd
            );

        subscription.currentPeriodEnd =
            addBillingInterval(
                subscription.currentPeriodEnd,
                plan.interval
            );

        subscription.status =
            "active";

        subscription.updatedAt =
            new Date();

        this.subscriptions.set(
            id,
            subscription
        );

        return clone(subscription);
    }
}
