export class BillingException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BillingException";
    }
}

export class ValidationException extends BillingException {
    constructor(message: string) {
        super(message);
        this.name = "ValidationException";
    }
}

export class NotFoundException extends BillingException {
    constructor(resource: string, id: string) {
        super(`${resource} '${id}' was not found`);
        this.name = "NotFoundException";
    }
}

export class ConflictException extends BillingException {
    constructor(message: string) {
        super(message);
        this.name = "ConflictException";
    }
}

export class PaymentException extends BillingException {
    constructor(message: string) {
        super(message);
        this.name = "PaymentException";
    }
}

export class InsufficientFundsException extends BillingException {
    constructor(message = "Insufficient funds") {
        super(message);
        this.name = "InsufficientFundsException";
    }
}
