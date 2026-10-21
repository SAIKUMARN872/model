import type {
    Plan,
} from "../models.js";
import { PlanService } from "../services/plan-service.js";

type PlanInput = Parameters<PlanService["create"]>[0];

export class PlanController {
    constructor(
        private readonly service:
            PlanService
    ) {}

    create(
        input: PlanInput
    ): Plan {
        return this.service.create(input);
    }

    get(id: string): Plan {
        return this.service.get(id);
    }

    update(
        id: string,
        input: Partial<PlanInput>
    ): Plan {
        return this.service.update(
            id,
            input
        );
    }

    list(
        activeOnly = false
    ): Plan[] {
        return this.service.list(
            activeOnly
        );
    }

    archive(id: string): Plan {
        return this.service.archive(id);
    }
}
