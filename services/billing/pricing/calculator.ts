import type { Plan } from "../models.js";
import {
    ValidationException
} from "../exceptions.js";
import { money } from "../utils.js";
import { PricingRules } from "./rules.js";

export class PricingCalculator {
    constructor(
        private readonly rules =
            new PricingRules()
    ) {}

    calculate(
        plan: Plan,
        quantity = 1,
        discountCode?: string
    ): number {
        if (
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            throw new ValidationException(
                "Quantity must be greater than zero"
            );
        }

        return this.rules.applyDiscount(
            money(plan.price * quantity),
            discountCode
        );
    }

    getRules(): PricingRules {
        return this.rules;
    }
}
