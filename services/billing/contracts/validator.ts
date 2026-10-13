import type { Contract } from "./contract.js";
import { ValidationException } from "../exceptions.js";

export class ContractValidator {
    validate(contract: Contract): void {
        if (!contract.customerId) {
            throw new ValidationException(
                "Contract customer is required"
            );
        }

        if (!contract.name.trim()) {
            throw new ValidationException(
                "Contract name is required"
            );
        }

        if (contract.minimumCommitment < 0) {
            throw new ValidationException(
                "Minimum commitment cannot be negative"
            );
        }
    }
}
