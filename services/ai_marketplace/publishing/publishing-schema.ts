export type PublishingStatus =
  | "queued"
  | "in_review"
  | "approved"
  | "rejected"
  | "published"
  | "cancelled";

export interface PublishingRequest {
  id: string;
  listingId: string;
  developerId: string;
  submittedBy: string;
  status: PublishingStatus;
  version: string;
  notes: string;
  reviewer?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreatePublishingInput {
  listingId: string;
  developerId: string;
  submittedBy: string;
  version: string;
  notes?: string;
}

export interface UpdatePublishingInput {
  status?: PublishingStatus;
  reviewer?: string;
  reviewNotes?: string;
}

export interface PublishingListOptions {
  listingId?: string;
  developerId?: string;
  status?: PublishingStatus;
}
