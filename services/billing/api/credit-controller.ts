import type {
    CreditBalance
} from "../models.js";
import { CreditService } from "../services/credit-service.js";

export class CreditController {
    constructor(
        private readonly service:
            CreditService
    ) {}

    get(
        customerId: string,
        currency?: string
    ): CreditBalance {
        return this.service.get(
            customerId,
            currency
        );
    }

    add(
        customerId: string,
        amount: number,
        currency?: string
    ): CreditBalance {
        return this.service.add(
            customerId,
            amount,
            currency
        );
    }

    consume(
        customerId: string,
        amount: number
    ): CreditBalance {
        return this.service.consume(
            customerId,
            amount
        );
    }
}
