import type { Wallet } from "../models.js";
import {
    InsufficientFundsException
} from "../exceptions.js";
import { clone, money } from "../utils.js";

export class WalletManager {
    private readonly wallets =
        new Map<string, Wallet>();

    get(
        customerId: string,
        currency = "USD"
    ): Wallet {
        const wallet =
            this.wallets.get(
                customerId
            );

        if (wallet) {
            return clone(wallet);
        }

        const created: Wallet = {
            customerId,
            balance: 0,
            currency:
                currency.toUpperCase(),
            updatedAt: new Date()
        };

        this.wallets.set(
            customerId,
            created
        );

        return clone(created);
    }

    deposit(
        customerId: string,
        amount: number,
        currency = "USD"
    ): Wallet {
        if (amount <= 0) {
            throw new Error(
                "Deposit amount must be positive"
            );
        }

        const wallet =
            this.wallets.get(
                customerId
            ) ??
            {
                customerId,
                balance: 0,
                currency:
                    currency.toUpperCase(),
                updatedAt: new Date()
            };

        wallet.balance =
            money(
                wallet.balance +
                amount
            );

        wallet.updatedAt =
            new Date();

        this.wallets.set(
            customerId,
            wallet
        );

        return clone(wallet);
    }

    withdraw(
        customerId: string,
        amount: number,
        allowNegative = false
    ): Wallet {
        if (amount <= 0) {
            throw new Error(
                "Withdrawal amount must be positive"
            );
        }

        const wallet =
            this.get(customerId);

        if (
            !allowNegative &&
            wallet.balance < amount
        ) {
            throw new InsufficientFundsException(
                "Insufficient wallet balance"
            );
        }

        wallet.balance =
            money(
                wallet.balance -
                amount
            );

        wallet.updatedAt =
            new Date();

        this.wallets.set(
            customerId,
            wallet
        );

        return clone(wallet);
    }
}
