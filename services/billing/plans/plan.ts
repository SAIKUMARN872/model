import { randomUUID } from "node:crypto";
import type { Plan } from "../models.js";
import { clone, money } from "../utils.js";
import { PlanValidator } from "./validator.js";

type PlanInput = Pick<Plan, "name" | "price"> &
    Partial<
        Pick<
            Plan,
            | "description"
            | "currency"
            | "interval"
            | "trialDays"
            | "metadata"
        >
    >;

export class PlanModel {
    private readonly value: Plan;

    constructor(
        input: PlanInput,
        validator = new PlanValidator()
    ) {
        validator.validate(input);

        const now = new Date();

        this.value = {
            id: randomUUID(),
            name: input.name.trim(),
            description:
                input.description?.trim() ?? "",
            price: money(input.price),
            currency: (
                input.currency ??
                "USD"
            ).toUpperCase(),
            interval:
                input.interval ?? "month",
            trialDays:
                input.trialDays ?? 0,
            active: true,
            metadata:
                clone(input.metadata ?? {}),
            createdAt: now,
            updatedAt: now
        };
    }

    get data(): Plan {
        return clone(this.value);
    }
}
