import { randomUUID } from "node:crypto";
import type {
    Invoice,
    InvoiceLine
} from "../models.js";
import {
    NotFoundException,
    ValidationException
} from "../exceptions.js";
import { clone, money } from "../utils.js";

export class InvoiceManager {
    private readonly invoices =
        new Map<string, Invoice>();

    create(
        customerId: string,
        currency: string,
        lines: InvoiceLine[],
        dueDays = 30,
        subscriptionId?: string
    ): Invoice {
        if (!lines.length) {
            throw new ValidationException(
                "Invoice requires at least one line"
            );
        }

        const subtotal =
            money(
                lines.reduce(
                    (sum, line) =>
                        sum + line.amount,
                    0
                )
            );

        const now = new Date();

        const invoice: Invoice = {
            id: randomUUID(),
            customerId,
            subscriptionId,
            number:
                `INV-${Date.now()}-${Math.floor(
                    Math.random() * 10000
                )}`,
            status: "open",
            currency:
                currency.toUpperCase(),
            subtotal,
            tax: 0,
            total: subtotal,
            amountDue: subtotal,
            amountPaid: 0,
            dueDate:
                new Date(
                    now.getTime() +
                        dueDays *
                            86400000
                ),
            lines: clone(lines),
            metadata: {},
            createdAt: now,
            updatedAt: now
        };

        this.invoices.set(
            invoice.id,
            invoice
        );

        return clone(invoice);
    }

    get(
        id: string
    ): Invoice {
        const invoice =
            this.invoices.get(id);

        if (!invoice) {
            throw new NotFoundException(
                "Invoice",
                id
            );
        }

        return clone(invoice);
    }

    listByCustomer(
        customerId: string
    ): Invoice[] {
        return [
            ...this.invoices.values()
        ]
            .filter(
                (invoice) =>
                    invoice.customerId ===
                    customerId
            )
            .map(clone);
    }

    applyTax(
        id: string,
        tax: number
    ): Invoice {
        const invoice =
            this.get(id);

        if (tax < 0) {
            throw new ValidationException(
                "Tax cannot be negative"
            );
        }

        invoice.tax =
            money(tax);

        invoice.total =
            money(
                invoice.subtotal +
                    invoice.tax
            );

        invoice.amountDue =
            money(
                invoice.total -
                    invoice.amountPaid
            );

        invoice.updatedAt =
            new Date();

        this.invoices.set(
            id,
            invoice
        );

        return clone(invoice);
    }

    markPaid(
        id: string,
        amount: number
    ): Invoice {
        const invoice =
            this.get(id);

        if (amount <= 0) {
            throw new ValidationException(
                "Payment amount must be positive"
            );
        }

        if (
            amount >
            invoice.amountDue
        ) {
            throw new ValidationException(
                "Payment exceeds invoice amount due"
            );
        }

        invoice.amountPaid =
            money(
                invoice.amountPaid +
                    amount
            );

        invoice.amountDue =
            money(
                invoice.total -
                    invoice.amountPaid
            );

        if (
            invoice.amountDue ===
            0
        ) {
            invoice.status =
                "paid";
        }

        invoice.updatedAt =
            new Date();

        this.invoices.set(
            id,
            invoice
        );

        return clone(invoice);
    }

    void(
        id: string
    ): Invoice {
        const invoice =
            this.get(id);

        if (
            invoice.status ===
            "paid"
        ) {
            throw new ValidationException(
                "Paid invoice cannot be voided"
            );
        }

        invoice.status =
            "void";

        invoice.updatedAt =
            new Date();

        this.invoices.set(
            id,
            invoice
        );

        return clone(invoice);
    }
}
