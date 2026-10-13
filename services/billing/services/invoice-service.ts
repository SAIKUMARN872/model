import type {
    Invoice,
    InvoiceLine
} from "../models.js";
import { InvoiceManager } from "../invoices/invoice.js";
import { TaxCalculator } from "../tax/calculator.js";

export class InvoiceService {
    constructor(
        private readonly invoices:
            InvoiceManager,
        private readonly tax:
            TaxCalculator,
        private readonly dueDays = 30
    ) {}

    create(
        customerId: string,
        currency: string,
        lines: InvoiceLine[],
        subscriptionId?: string
    ): Invoice {
        const invoice =
            this.invoices.create(
                customerId,
                currency,
                lines,
                this.dueDays,
                subscriptionId
            );

        return this.invoices.applyTax(
            invoice.id,
            this.tax.calculate(
                invoice.subtotal
            )
        );
    }

    get(id: string): Invoice {
        return this.invoices.get(id);
    }

    list(
        customerId: string
    ): Invoice[] {
        return this.invoices.listByCustomer(
            customerId
        );
    }

    void(id: string): Invoice {
        return this.invoices.void(id);
    }
}
