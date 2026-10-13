export class UsageCalculator {
    calculate(
        quantity: number,
        unitPrice: number
    ): number {
        if (
            quantity < 0 ||
            unitPrice < 0
        ) {
            throw new Error(
                "Usage values cannot be negative"
            );
        }

        return Math.round(
            quantity *
                unitPrice *
                100
        ) / 100;
    }
}
