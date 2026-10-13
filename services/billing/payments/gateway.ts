import type {
    PaymentStatus
} from "../interfaces.js";

export interface PaymentGatewayResult {
    id: string;
    status: PaymentStatus;
    provider: string;
}

export interface PaymentGateway {
    charge(
        customerId: string,
        amount: number,
        currency: string,
        metadata?: Record<string, unknown>
    ): Promise<PaymentGatewayResult>;
}
