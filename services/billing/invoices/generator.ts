import type {
    Invoice,
    InvoiceLine
} from "../models.js";
import { InvoiceManager } from "./invoice.js";

export class InvoiceGenerator {
    constructor(
        private readonly manager:
            InvoiceManager
    ) {}

    generate(
        customerId: string,
        currency: string,
        lines: InvoiceLine[],
        dueDays = 30,
        subscriptionId?: string
    ): Invoice {
        return this.manager.create(
            customerId,
            currency,
            lines,
            dueDays,
            subscriptionId
        );
    }
}
