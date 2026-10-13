export type ReviewStatus = "published" | "hidden" | "removed";

export interface MarketplaceReview {
  id: string;
  listingId: string;
  reviewerId: string;
  installationId?: string;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  developerResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  listingId: string;
  reviewerId: string;
  installationId?: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  comment?: string;
  status?: ReviewStatus;
  developerResponse?: string;
}

export interface ReviewListOptions {
  listingId?: string;
  reviewerId?: string;
  rating?: number;
  status?: ReviewStatus;
}
