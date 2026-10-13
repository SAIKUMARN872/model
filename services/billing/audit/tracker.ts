export class BillingTracker {
    private readonly counters =
        new Map<string, number>();

    increment(
        name: string,
        amount = 1
    ): number {
        const value =
            (
                this.counters.get(
                    name
                ) ?? 0
            ) + amount;

        this.counters.set(
            name,
            value
        );

        return value;
    }

    get(
        name: string
    ): number {
        return (
            this.counters.get(
                name
            ) ?? 0
        );
    }

    snapshot(): Record<string, number> {
        return Object.fromEntries(
            this.counters.entries()
        );
    }
}
