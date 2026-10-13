import { randomUUID } from "node:crypto";
import type {
    Payment,
    Refund
} from "../models.js";
import {
    NotFoundException,
    ValidationException
} from "../exceptions.js";
import { PaymentProcessor } from "../payments/processor.js";

export class RefundProcessor {
    private readonly refunds =
        new Map<string, Refund>();

    constructor(
        private readonly payments:
            PaymentProcessor
    ) {}

    process(
        paymentId: string,
        amount: number,
        reason?: string
    ): Refund {
        const payment =
            this.payments.get(
                paymentId
            );

        if (amount <= 0) {
            throw new ValidationException(
                "Refund amount must be positive"
            );
        }

        if (
            amount > payment.amount
        ) {
            throw new ValidationException(
                "Refund exceeds payment amount"
            );
        }

        const now = new Date();

        const refund: Refund = {
            id: randomUUID(),
            paymentId,
            amount,
            reason,
            status: "succeeded",
            createdAt: now,
            updatedAt: now
        };

        this.refunds.set(
            refund.id,
            refund
        );

        if (
            amount ===
            payment.amount
        ) {
            this.payments.markRefunded(
                paymentId
            );
        }

        return refund;
    }

    get(id: string): Refund {
        const refund =
            this.refunds.get(id);

        if (!refund) {
            throw new NotFoundException(
                "Refund",
                id
            );
        }

        return refund;
    }
}
