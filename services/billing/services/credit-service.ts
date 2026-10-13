import type {
    CreditBalance
} from "../models.js";
import { CreditManager } from "../credits/manager.js";

export class CreditService {
    constructor(
        private readonly credits:
            CreditManager
    ) {}

    get(
        customerId: string,
        currency?: string
    ): CreditBalance {
        return this.credits.get(
            customerId,
            currency
        );
    }

    add(
        customerId: string,
        amount: number,
        currency?: string
    ): CreditBalance {
        return this.credits.add(
            customerId,
            amount,
            currency
        );
    }

    consume(
        customerId: string,
        amount: number
    ): CreditBalance {
        return this.credits.consume(
            customerId,
            amount
        );
    }
}
