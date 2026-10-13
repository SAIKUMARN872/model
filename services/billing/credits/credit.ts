import type { CreditBalance } from "../models.js";
import { clone, money } from "../utils.js";

export class Credit {
    constructor(
        private readonly value: CreditBalance
    ) {}

    get data(): CreditBalance {
        return clone(this.value);
    }

    add(amount: number): CreditBalance {
        this.value.balance =
            money(
                this.value.balance +
                amount
            );

        this.value.updatedAt =
            new Date();

        return this.data;
    }

    consume(amount: number): CreditBalance {
        this.value.balance =
            money(
                this.value.balance -
                amount
            );

        this.value.updatedAt =
            new Date();

        return this.data;
    }
}
