import { ValidationException } from "../exceptions.js";

export class PricingRules {
    private readonly discounts =
        new Map<string, number>();

    setDiscount(
        code: string,
        percent: number
    ): void {
        if (
            percent < 0 ||
            percent > 100
        ) {
            throw new ValidationException(
                "Discount must be between 0 and 100"
            );
        }

        this.discounts.set(
            code.trim().toUpperCase(),
            percent
        );
    }

    getDiscount(
        code?: string
    ): number {
        if (!code) {
            return 0;
        }

        return (
            this.discounts.get(
                code.trim().toUpperCase()
            ) ?? 0
        );
    }

    applyDiscount(
        amount: number,
        code?: string
    ): number {
        const percent =
            this.getDiscount(code);

        return Math.round(
            amount *
                (1 - percent / 100) *
                100
        ) / 100;
    }
}
