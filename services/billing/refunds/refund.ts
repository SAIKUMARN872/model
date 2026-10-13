export interface RefundRequest {
    paymentId: string;
    amount: number;
    reason?: string;
}
