import {
    ValidationException
} from "../exceptions.js";

export class UsageMeter {
    constructor(
        public readonly name: string,
        public readonly unitPrice: number
    ) {
        if (!name.trim()) {
            throw new ValidationException(
                "Meter name is required"
            );
        }

        if (unitPrice < 0) {
            throw new ValidationException(
                "Unit price cannot be negative"
            );
        }
    }
}
