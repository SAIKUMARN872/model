import { randomUUID } from "node:crypto";
import type {
    UsageRecord
} from "../models.js";
import { clone } from "../utils.js";
import { UsageCalculator } from "./calculator.js";
import { UsageMeter } from "./meter.js";

export class UsageTracker {
    private readonly records =
        new Map<string, UsageRecord>();

    private readonly calculator =
        new UsageCalculator();

    record(
        customerId: string,
        meter: UsageMeter,
        quantity: number,
        metadata: Record<string, unknown> = {}
    ): UsageRecord {
        const record: UsageRecord = {
            id: randomUUID(),
            customerId,
            meter: meter.name,
            quantity,
            unitPrice: meter.unitPrice,
            amount:
                this.calculator.calculate(
                    quantity,
                    meter.unitPrice
                ),
            timestamp: new Date(),
            metadata: clone(metadata)
        };

        this.records.set(
            record.id,
            record
        );

        return clone(record);
    }

    list(
        customerId: string,
        meter?: string
    ): UsageRecord[] {
        return [
            ...this.records.values()
        ]
            .filter(
                (record) =>
                    record.customerId ===
                        customerId &&
                    (
                        meter ===
                            undefined ||
                        record.meter ===
                            meter
                    )
            )
            .map(clone);
    }

    total(
        customerId: string,
        meter?: string
    ): number {
        return Math.round(
            this.list(
                customerId,
                meter
            ).reduce(
                (sum, record) =>
                    sum + record.amount,
                0
            ) * 100
        ) / 100;
    }
}
