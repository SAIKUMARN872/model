import type { Invoice } from "../models.js";
import { InvoiceManager } from "../invoices/invoice.js";

export class InvoiceRepository {
    constructor(
        private readonly manager:
            InvoiceManager
    ) {}

    findById(
        id: string
    ): Invoice {
        return this.manager.get(id);
    }

    findByCustomer(
        customerId: string
    ): Invoice[] {
        return this.manager.listByCustomer(
            customerId
        );
    }
}
