from ..constants import ExecutionStatus


def workflow_succeeded(result):
    return result.status == ExecutionStatus.SUCCESS


def workflow_failed(result):
    return result.status == ExecutionStatus.ERROR


def workflow_summary(result):
    return {
        "workflow_id": result.workflow_id,
        "status": result.status.value,
        "completed_steps": result.completed_steps,
        "failed_steps": result.failed_steps,
        "total_recorded_steps": len(result.step_results),
    }


__all__ = ["workflow_succeeded", "workflow_failed", "workflow_summary"]
