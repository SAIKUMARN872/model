import type {
    CreditBalance
} from "../models.js";
import {
    InsufficientFundsException
} from "../exceptions.js";
import { clone, money } from "../utils.js";

export class CreditManager {
    private readonly balances =
        new Map<string, CreditBalance>();

    get(
        customerId: string,
        currency = "USD"
    ): CreditBalance {
        const existing =
            this.balances.get(
                customerId
            );

        if (existing) {
            return clone(existing);
        }

        const balance: CreditBalance = {
            customerId,
            balance: 0,
            currency:
                currency.toUpperCase(),
            updatedAt: new Date()
        };

        this.balances.set(
            customerId,
            balance
        );

        return clone(balance);
    }

    add(
        customerId: string,
        amount: number,
        currency = "USD"
    ): CreditBalance {
        if (amount <= 0) {
            throw new Error(
                "Credit amount must be positive"
            );
        }

        const balance =
            this.balances.get(
                customerId
            ) ??
            {
                customerId,
                balance: 0,
                currency:
                    currency.toUpperCase(),
                updatedAt: new Date()
            };

        balance.balance =
            money(
                balance.balance +
                amount
            );

        balance.updatedAt =
            new Date();

        this.balances.set(
            customerId,
            balance
        );

        return clone(balance);
    }

    consume(
        customerId: string,
        amount: number
    ): CreditBalance {
        if (amount <= 0) {
            throw new Error(
                "Credit amount must be positive"
            );
        }

        const balance =
            this.get(customerId);

        if (
            balance.balance <
            amount
        ) {
            throw new InsufficientFundsException(
                "Insufficient credit balance"
            );
        }

        balance.balance =
            money(
                balance.balance -
                amount
            );

        balance.updatedAt =
            new Date();

        this.balances.set(
            customerId,
            balance
        );

        return clone(balance);
    }
}
