import { randomUUID } from "node:crypto";
import type {
    BillingCustomer,
    CustomerInput
} from "../models.js";
import { ValidationException } from "../exceptions.js";
import { clone } from "../utils.js";

export class Customer {
    private readonly value: BillingCustomer;

    constructor(input: CustomerInput) {
        if (!input.email.includes("@")) {
            throw new ValidationException(
                "Invalid customer email"
            );
        }

        if (!input.name.trim()) {
            throw new ValidationException(
                "Customer name is required"
            );
        }

        const now = new Date();

        this.value = {
            id: randomUUID(),
            email: input.email.trim().toLowerCase(),
            name: input.name.trim(),
            currency: (
                input.currency ??
                "USD"
            ).toUpperCase(),
            status: "active",
            metadata: clone(input.metadata ?? {}),
            createdAt: now,
            updatedAt: now
        };
    }

    get data(): BillingCustomer {
        return clone(this.value);
    }
}
