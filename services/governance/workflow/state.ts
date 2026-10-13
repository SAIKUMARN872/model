export type WorkflowState = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface WorkflowStateRecord {
    workflowId: string;
    state: WorkflowState;
    changedAt: string;
    changedBy: string;
    reason?: string;
}

const allowedTransitions: Record<WorkflowState, WorkflowState[]> = {
    pending: ["running", "cancelled"],
    running: ["completed", "failed", "cancelled"],
    completed: [],
    failed: ["pending"],
    cancelled: []
};

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
    return allowedTransitions[from].includes(to);
}

export function transitionWorkflow(
    current: WorkflowStateRecord,
    next: WorkflowState,
    actor: string,
    reason?: string
): WorkflowStateRecord {
    if (!canTransition(current.state, next)) {
        throw new Error(`Invalid workflow transition: ${current.state} -> ${next}`);
    }
    return {
        ...current,
        state: next,
        changedAt: new Date().toISOString(),
        changedBy: actor,
        ...(reason === undefined ? {} : { reason })
    };
}
