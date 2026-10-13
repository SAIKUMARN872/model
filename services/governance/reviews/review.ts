export interface GovernanceReview {
    id: string;
    subjectType: "policy" | "model" | "dataset" | "process";
    subjectId: string;
    reviewer: string;
    rating: number;
    comments: string;
    createdAt: string;
}

export function validateReview(review: GovernanceReview): string[] {
    const errors: string[] = [];
    if (!review.id.trim()) errors.push("Review id is required");
    if (!review.reviewer.trim()) errors.push("Reviewer is required");
    if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
        errors.push("Rating must be an integer from 1 to 5");
    }
    if (!review.comments.trim()) errors.push("Comments are required");
    return errors;
}
