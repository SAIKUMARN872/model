import type {
    Plan,
    PlanInput
} from "../models.js";
import { PlanCatalog } from "../plans/catalog.js";

export class PlanService {
    constructor(
        private readonly plans:
            PlanCatalog
    ) {}

    create(
        input: PlanInput
    ): Plan {
        return this.plans.create(input);
    }

    get(id: string): Plan {
        return this.plans.get(id);
    }

    update(
        id: string,
        input: Partial<PlanInput>
    ): Plan {
        return this.plans.update(
            id,
            input
        );
    }

    list(
        activeOnly = false
    ): Plan[] {
        return this.plans.list(
            activeOnly
        );
    }

    archive(id: string): Plan {
        return this.plans.archive(id);
    }
}
