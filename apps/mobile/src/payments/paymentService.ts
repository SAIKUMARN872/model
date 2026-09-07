export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status:
    | "pending"
    | "completed"
    | "failed"
    | "refunded";
  createdAt: string;
}

export class PaymentService {
  private payments: Map<
    string,
    Payment
  > = new Map();

  public createPayment(
    userId: string,
    amount: number,
    currency: string = "USD"
  ): Payment {
    if (!userId.trim()) {
      throw new Error(
        "User ID is required."
      );
    }

    if (amount <= 0) {
      throw new Error(
        "Payment amount must be greater than zero."
      );
    }

    const payment: Payment = {
      id: this.generateId(),
      userId,
      amount,
      currency,
      status: "pending",
      createdAt:
        new Date().toISOString(),
    };

    this.payments.set(
      payment.id,
      payment
    );

    return payment;
  }

  public getPayment(
    id: string
  ): Payment | undefined {
    return this.payments.get(id);
  }

  public getUserPayments(
    userId: string
  ): Payment[] {
    return Array.from(
      this.payments.values()
    ).filter(
      (payment) =>
        payment.userId === userId
    );
  }

  public completePayment(
    id: string
  ): Payment | undefined {
    return this.updateStatus(
      id,
      "completed"
    );
  }

  public failPayment(
    id: string
  ): Payment | undefined {
    return this.updateStatus(
      id,
      "failed"
    );
  }

  public refundPayment(
    id: string
  ): Payment | undefined {
    return this.updateStatus(
      id,
      "refunded"
    );
  }

  private updateStatus(
    id: string,
    status: Payment["status"]
  ): Payment | undefined {
    const payment =
      this.payments.get(id);

    if (!payment) {
      return undefined;
    }

    payment.status = status;

    this.payments.set(
      id,
      payment
    );

    return payment;
  }

  public deletePayment(
    id: string
  ): boolean {
    return this.payments.delete(id);
  }

  public getAllPayments(): Payment[] {
    return Array.from(
      this.payments.values()
    );
  }

  public clear(): void {
    this.payments.clear();
  }

  public count(): number {
    return this.payments.size;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const paymentService =
  new PaymentService();

export default paymentService;