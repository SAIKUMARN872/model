import type {
    BillingCustomer,
    CustomerInput
} from "../models.js";
import { Customer } from "./customer.js";
import {
    NotFoundException,
    ValidationException
} from "../exceptions.js";
import { clone } from "../utils.js";

export class CustomerManager {
    private readonly customers =
        new Map<string, BillingCustomer>();

    create(input: CustomerInput): BillingCustomer {
        const customer = new Customer(input).data;

        this.customers.set(
            customer.id,
            customer
        );

        return clone(customer);
    }

    get(id: string): BillingCustomer {
        const customer =
            this.customers.get(id);

        if (!customer) {
            throw new NotFoundException(
                "Customer",
                id
            );
        }

        return clone(customer);
    }

    update(
        id: string,
        input: Partial<CustomerInput>
    ): BillingCustomer {
        const customer = this.get(id);

        if (
            input.email !== undefined &&
            !input.email.includes("@")
        ) {
            throw new ValidationException(
                "Invalid customer email"
            );
        }

        if (
            input.name !== undefined &&
            !input.name.trim()
        ) {
            throw new ValidationException(
                "Customer name is required"
            );
        }

        if (input.email !== undefined) {
            customer.email =
                input.email
                    .trim()
                    .toLowerCase();
        }

        if (input.name !== undefined) {
            customer.name =
                input.name.trim();
        }

        if (input.currency !== undefined) {
            customer.currency =
                input.currency.toUpperCase();
        }

        if (input.metadata !== undefined) {
            customer.metadata =
                clone(input.metadata);
        }

        customer.updatedAt =
            new Date();

        this.customers.set(
            id,
            customer
        );

        return clone(customer);
    }

    suspend(id: string): BillingCustomer {
        const customer = this.get(id);
        customer.status = "suspended";
        customer.updatedAt = new Date();

        this.customers.set(id, customer);

        return clone(customer);
    }

    activate(id: string): BillingCustomer {
        const customer = this.get(id);
        customer.status = "active";
        customer.updatedAt = new Date();

        this.customers.set(id, customer);

        return clone(customer);
    }

    list(): BillingCustomer[] {
        return [
            ...this.customers.values()
        ].map(clone);
    }
}
