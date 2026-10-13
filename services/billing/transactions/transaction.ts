import { randomUUID } from "node:crypto";
import type {
    TransactionType,
    Transaction
} from "../models.js";
import { money } from "../utils.js";

export function createTransaction(
    customerId: string,
    type: TransactionType,
    amount: number,
    currency: string,
    referenceId?: string,
    description?: string
): Transaction {
    return {
        id: randomUUID(),
        customerId,
        type,
        amount: money(amount),
        currency: currency.toUpperCase(),
        referenceId,
        description,
        createdAt: new Date()
    };
}
