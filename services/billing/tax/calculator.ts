import {
    ValidationException
} from "../exceptions.js";

export class TaxCalculator {
    constructor(
        private readonly defaultRate = 0
    ) {
        if (
            defaultRate < 0 ||
            defaultRate > 1
        ) {
            throw new ValidationException(
                "Tax rate must be between 0 and 1"
            );
        }
    }

    calculate(
        amount: number,
        rate = this.defaultRate
    ): number {
        if (amount < 0) {
            throw new ValidationException(
                "Amount cannot be negative"
            );
        }

        if (
            rate < 0 ||
            rate > 1
        ) {
            throw new ValidationException(
                "Tax rate must be between 0 and 1"
            );
        }

        return Math.round(
            amount * rate * 100
        ) / 100;
    }
}
