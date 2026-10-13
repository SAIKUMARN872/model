import type { Contract } from "./contract.js";

export interface EnterpriseContract
    extends Contract {
    accountManager?: string;
    seats: number;
    discountPercent: number;
}
