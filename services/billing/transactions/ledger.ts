import type {
    Transaction,
} from "../models.js";
import { clone } from "../utils.js";
import {
    createTransaction
} from "./transaction.js";

export class TransactionLedger {
    private readonly transactions:
        Transaction[] = [];

    record(
        customerId: string,
        type: Transaction["type"],
        amount: number,
        currency: string,
        referenceId?: string,
        description?: string
    ): Transaction {
        const transaction =
            createTransaction(
                customerId,
                type,
                amount,
                currency,
                referenceId,
                description
            );

        this.transactions.push(
            transaction
        );

        return clone(transaction);
    }

    list(
        customerId?: string
    ): Transaction[] {
        return this.transactions
            .filter(
                (item) =>
                    customerId ===
                        undefined ||
                    item.customerId ===
                        customerId
            )
            .map(clone);
    }
}
