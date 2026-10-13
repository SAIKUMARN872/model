import type { WorkflowState, WorkflowStateRecord } from "./state.js";

export interface GovernanceWorkflow {
    id: string;
    name: string;
    steps: string[];
    state: WorkflowStateRecord;
    createdAt: string;
}

export function createWorkflow(
    id: string,
    name: string,
    steps: string[],
    actor: string
): GovernanceWorkflow {
    if (!id.trim() || !name.trim()) throw new Error("Workflow id and name are required");
    if (steps.length === 0) throw new Error("Workflow must contain at least one step");

    const state: WorkflowStateRecord = {
        workflowId: id,
        state: "pending",
        changedAt: new Date().toISOString(),
        changedBy: actor
    };
    return { id, name, steps: [...steps], state, createdAt: new Date().toISOString() };
}

export function workflowIsTerminal(state: WorkflowState): boolean {
    return state === "completed" || state === "cancelled";
}
