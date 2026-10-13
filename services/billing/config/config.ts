import { BILLING_DEFAULTS, BILLING_LIMITS } from "../constants.js";
import type { BillingConfig } from "../interfaces.js";
import { ValidationException } from "../exceptions.js";

export function createBillingConfig(
    input: Partial<BillingConfig> = {}
): BillingConfig {
    const config: BillingConfig = {
        currency: (
            input.currency ??
            BILLING_DEFAULTS.CURRENCY
        ).toUpperCase(),

        taxRate:
            input.taxRate ??
            BILLING_DEFAULTS.TAX_RATE,

        invoiceDueDays:
            input.invoiceDueDays ??
            BILLING_DEFAULTS.INVOICE_DUE_DAYS,

        defaultTrialDays:
            input.defaultTrialDays ??
            BILLING_DEFAULTS.TRIAL_DAYS,

        paymentProvider:
            input.paymentProvider ??
            BILLING_DEFAULTS.PAYMENT_PROVIDER,

        allowNegativeWallet:
            input.allowNegativeWallet ??
            false
    };

    validateBillingConfig(config);

    return config;
}

export function validateBillingConfig(
    config: BillingConfig
): void {
    if (!config.currency.trim()) {
        throw new ValidationException(
            "Currency is required"
        );
    }

    if (
        config.taxRate < 0 ||
        config.taxRate > BILLING_LIMITS.MAX_TAX_RATE
    ) {
        throw new ValidationException(
            "Tax rate must be between 0 and 1"
        );
    }

    if (config.invoiceDueDays < 0) {
        throw new ValidationException(
            "Invoice due days cannot be negative"
        );
    }

    if (config.defaultTrialDays < 0) {
        throw new ValidationException(
            "Trial days cannot be negative"
        );
    }
}
