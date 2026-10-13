import type { Invoice } from "../models.js";
import { clone } from "../utils.js";

export class InvoiceHistory {
    private readonly history =
        new Map<
            string,
            Invoice[]
        >();

    record(
        invoice: Invoice
    ): void {
        const entries =
            this.history.get(
                invoice.id
            ) ?? [];

        entries.push(
            clone(invoice)
        );

        this.history.set(
            invoice.id,
            entries
        );
    }

    get(
        invoiceId: string
    ): Invoice[] {
        return clone(
            this.history.get(
                invoiceId
            ) ?? []
        );
    }
}
