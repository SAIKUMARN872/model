export interface ApprovalRequest {
  id: string;
  approved: boolean;
  reason?: string;
}

export class ApprovalWorker {
  approve(id: string, reason?: string): ApprovalRequest {
    if (!id?.trim()) {
      throw new Error("Approval id is required");
    }

    return {
      id: id.trim(),
      approved: true,
      ...(reason !== undefined ? { reason } : {}),
    };
  }

  reject(id: string, reason?: string): ApprovalRequest {
    if (!id?.trim()) {
      throw new Error("Approval id is required");
    }

    return {
      id: id.trim(),
      approved: false,
      ...(reason !== undefined ? { reason } : {}),
    };
  }
}

export const approvalWorker = new ApprovalWorker();

