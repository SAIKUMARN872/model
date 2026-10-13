import type {
    Plan,
    PlanInput
} from "../models.js";
import {
    NotFoundException
} from "../exceptions.js";
import { clone, money } from "../utils.js";
import { PlanModel } from "./plan.js";
import { PlanValidator } from "./validator.js";

export class PlanCatalog {
    private readonly plans =
        new Map<string, Plan>();

    constructor(
        private readonly validator =
            new PlanValidator()
    ) {}

    create(input: PlanInput): Plan {
        const plan =
            new PlanModel(
                input,
                this.validator
            ).data;

        this.plans.set(
            plan.id,
            plan
        );

        return clone(plan);
    }

    get(id: string): Plan {
        const plan =
            this.plans.get(id);

        if (!plan) {
            throw new NotFoundException(
                "Plan",
                id
            );
        }

        return clone(plan);
    }

    update(
        id: string,
        input: Partial<PlanInput>
    ): Plan {
        const plan = this.get(id);

        const updated: PlanInput = {
            name:
                input.name ??
                plan.name,

            description:
                input.description ??
                plan.description,

            price:
                input.price ??
                plan.price,

            currency:
                input.currency ??
                plan.currency,

            interval:
                input.interval ??
                plan.interval,

            trialDays:
                input.trialDays ??
                plan.trialDays,

            metadata:
                input.metadata ??
                plan.metadata
        };

        this.validator.validate(updated);

        plan.name =
            updated.name.trim();

        plan.description =
            updated.description?.trim() ?? "";

        plan.price =
            money(updated.price);

        plan.currency =
            (
                updated.currency ??
                plan.currency
            ).toUpperCase();

        plan.interval =
            updated.interval ??
            plan.interval;

        plan.trialDays =
            updated.trialDays ?? 0;

        plan.metadata =
            clone(updated.metadata ?? {});

        plan.updatedAt =
            new Date();

        this.plans.set(id, plan);

        return clone(plan);
    }

    archive(id: string): Plan {
        const plan = this.get(id);

        plan.active = false;
        plan.updatedAt = new Date();

        this.plans.set(id, plan);

        return clone(plan);
    }

    list(
        activeOnly = false
    ): Plan[] {
        return [
            ...this.plans.values()
        ]
            .filter(
                (plan) =>
                    !activeOnly ||
                    plan.active
            )
            .map(clone);
    }
}
