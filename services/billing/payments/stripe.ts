import type {
    PaymentGateway,
    PaymentGatewayResult
} from "./gateway.js";

export class StripePaymentGateway
    implements PaymentGateway
{
    constructor(
        private readonly secretKey: string
    ) {
        if (!secretKey) {
            throw new Error(
                "Stripe secret key is required"
            );
        }
    }

    async charge(
        _customerId: string,
        amount: number,
        _currency: string
    ): Promise<PaymentGatewayResult> {
        if (amount <= 0) {
            throw new Error(
                "Payment amount must be positive"
            );
        }

        return {
            id:
                "stripe_" +
                Date.now().toString(36),
            status: "succeeded",
            provider: "stripe"
        };
    }
}
