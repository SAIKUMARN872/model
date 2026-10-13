import type { BillingConfig } from "../interfaces.js";
import { createBillingConfig } from "./config.js";

export class BillingSettings {
    private readonly config: BillingConfig;

    constructor(config: Partial<BillingConfig> = {}) {
        this.config = createBillingConfig(config);
    }

    get(): BillingConfig {
        return {
            ...this.config
        };
    }

    getCurrency(): string {
        return this.config.currency;
    }

    getTaxRate(): number {
        return this.config.taxRate;
    }

    getInvoiceDueDays(): number {
        return this.config.invoiceDueDays;
    }

    getPaymentProvider(): string {
        return this.config.paymentProvider;
    }

    allowsNegativeWallet(): boolean {
        return this.config.allowNegativeWallet;
    }
}
