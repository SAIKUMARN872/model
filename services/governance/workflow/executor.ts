import type { GovernanceWorkflow } from "./workflow.js";
import { transitionWorkflow, type WorkflowState } from "./state.js";

export class WorkflowExecutor {
    private readonly workflows = new Map<string, GovernanceWorkflow>();

    register(workflow: GovernanceWorkflow): GovernanceWorkflow {
        if (this.workflows.has(workflow.id)) throw new Error("Workflow already registered");
        this.workflows.set(workflow.id, structuredClone(workflow));
        return structuredClone(workflow);
    }

    get(id: string): GovernanceWorkflow | undefined {
        const workflow = this.workflows.get(id);
        return workflow ? structuredClone(workflow) : undefined;
    }

    transition(id: string, next: WorkflowState, actor: string, reason?: string): GovernanceWorkflow {
        const workflow = this.workflows.get(id);
        if (!workflow) throw new Error("Workflow not found");
        workflow.state = transitionWorkflow(workflow.state, next, actor, reason);
        return structuredClone(workflow);
    }

    list(): GovernanceWorkflow[] {
        return [...this.workflows.values()].map((workflow) => structuredClone(workflow));
    }
}
