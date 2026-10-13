export interface PaymentRequest {
    customerId: string;
    amount: number;
    currency: string;
    invoiceId?: string;
}
