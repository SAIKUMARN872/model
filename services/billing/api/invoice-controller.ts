import type {
    Invoice,
    InvoiceLine
} from "../models.js";
import { InvoiceService } from "../services/invoice-service.js";

export class InvoiceController {
    constructor(
        private readonly service:
            InvoiceService
    ) {}

    create(
        customerId: string,
        currency: string,
        lines: InvoiceLine[],
        subscriptionId?: string
    ): Invoice {
        return this.service.create(
            customerId,
            currency,
            lines,
            subscriptionId
        );
    }

    get(id: string): Invoice {
        return this.service.get(id);
    }

    list(
        customerId: string
    ): Invoice[] {
        return this.service.list(
            customerId
        );
    }

    void(id: string): Invoice {
        return this.service.void(id);
    }
}
