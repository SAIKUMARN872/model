import { randomUUID } from "node:crypto";
import type {
    Payment
} from "../models.js";
import type {
    PaymentGateway
} from "./gateway.js";
import {
    PaymentException
} from "../exceptions.js";

export class InMemoryPaymentGateway
    implements PaymentGateway
{
    async charge(
        _customerId: string,
        amount: number,
        _currency: string
    ) {
        if (amount <= 0) {
            throw new PaymentException(
                "Payment amount must be positive"
            );
        }

        return {
            id: randomUUID(),
            status:
                "succeeded" as const,
            provider: "memory"
        };
    }
}

export class PaymentProcessor {
    private readonly payments =
        new Map<string, Payment>();

    constructor(
        private readonly gateway:
            PaymentGateway =
                new InMemoryPaymentGateway()
    ) {}

    async process(
        customerId: string,
        amount: number,
        currency: string,
        invoiceId?: string
    ): Promise<Payment> {
        const result =
            await this.gateway.charge(
                customerId,
                amount,
                currency
            );

        const now = new Date();

        const payment: Payment = {
            id: randomUUID(),
            customerId,
            invoiceId,
            amount,
            currency:
                currency.toUpperCase(),
            status: result.status,
            provider: result.provider,
            providerPaymentId:
                result.id,
            createdAt: now,
            updatedAt: now
        };

        this.payments.set(
            payment.id,
            payment
        );

        return {
            ...payment
        };
    }

    get(id: string): Payment {
        const payment =
            this.payments.get(id);

        if (!payment) {
            throw new PaymentException(
                `Payment '${id}' was not found`
            );
        }

        return {
            ...payment
        };
    }

    markRefunded(
        id: string
    ): Payment {
        const payment =
            this.payments.get(id);

        if (!payment) {
            throw new PaymentException(
                `Payment '${id}' was not found`
            );
        }

        payment.status = "refunded";
        payment.updatedAt =
            new Date();

        return {
            ...payment
        };
    }

    listByCustomer(
        customerId: string
    ): Payment[] {
        return [
            ...this.payments.values()
        ]
            .filter(
                (payment) =>
                    payment.customerId ===
                    customerId
            )
            .map((payment) => ({
                ...payment
            }));
    }
}
