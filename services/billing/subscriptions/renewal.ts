import type { Plan } from "../models.js";
import { SubscriptionManager } from "./manager.js";

export class SubscriptionRenewal {
    constructor(
        private readonly manager:
            SubscriptionManager
    ) {}

    renew(
        id: string,
        plan: Plan
    ) {
        return this.manager.renew(
            id,
            plan
        );
    }
}
