export interface ReviewFeedback {
    reviewId: string;
    submittedBy: string;
    helpful: boolean;
    comment?: string;
    submittedAt: string;
}

export function createReviewFeedback(
    input: Omit<ReviewFeedback, "submittedAt">,
    now = new Date().toISOString()
): ReviewFeedback {
    if (!input.reviewId.trim()) throw new Error("reviewId is required");
    if (!input.submittedBy.trim()) throw new Error("submittedBy is required");
    return { ...input, submittedAt: now };
}
