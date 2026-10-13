import type { Plan } from "../models.js";
import { PricingCalculator } from "./calculator.js";

export class PricingService {
    constructor(
        private readonly calculator =
            new PricingCalculator()
    ) {}

    calculate(
        plan: Plan,
        quantity = 1,
        discountCode?: string
    ): number {
        return this.calculator.calculate(
            plan,
            quantity,
            discountCode
        );
    }

    getRules() {
        return this.calculator.getRules();
    }
}
