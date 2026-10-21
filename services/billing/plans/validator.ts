import type { Plan } from "../models.js";
import { ValidationException } from "../exceptions.js";

type PlanInput = Pick<Plan, "name" | "price"> &
    Partial<Pick<
        Plan,
        | "description"
        | "currency"
        | "interval"
        | "trialDays"
        | "metadata"
    >>;

export class PlanValidator {
    validate(input: PlanInput): void {
        if (!input.name?.trim()) {
            throw new ValidationException(
                "Plan name is required"
            );
        }

        if (
            input.price === undefined ||
            !Number.isFinite(input.price) ||
            input.price <= 0
        ) {
            throw new ValidationException(
                "Plan price must be greater than zero"
            );
        }

        if (
            input.trialDays !== undefined &&
            input.trialDays < 0
        ) {
            throw new ValidationException(
                "Trial days cannot be negative"
            );
        }
    }

    validatePlan(plan: Plan): void {
        this.validate({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            interval: plan.interval,
            trialDays: plan.trialDays,
            metadata: plan.metadata
        });
    }
}
