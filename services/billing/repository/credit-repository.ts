import type {
    CreditBalance
} from "../models.js";
import { CreditManager } from "../credits/manager.js";

export class CreditRepository {
    constructor(
        private readonly manager: CreditManager
    ) {}

    findByCustomer(
        customerId: string,
        currency?: string
    ): CreditBalance {
        return this.manager.get(
            customerId,
            currency
        );
    }
}
