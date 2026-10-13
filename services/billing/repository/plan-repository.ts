import type { Plan } from "../models.js";
import { PlanCatalog } from "../plans/catalog.js";

export class PlanRepository {
    constructor(
        private readonly catalog: PlanCatalog
    ) {}

    findById(id: string): Plan {
        return this.catalog.get(id);
    }

    findAll(
        activeOnly = false
    ): Plan[] {
        return this.catalog.list(
            activeOnly
        );
    }
}
