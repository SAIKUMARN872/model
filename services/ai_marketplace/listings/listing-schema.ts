export type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "suspended"
  | "archived";

export type ListingVisibility = "public" | "private";

export interface MarketplaceListing {
  id: string;
  developerId: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  category: string;
  status: ListingStatus;
  visibility: ListingVisibility;
  price: number;
  currency: string;
  tags: string[];
  configurationSchema: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CreateListingInput {
  developerId: string;
  name: string;
  slug: string;
  description?: string;
  version?: string;
  category?: string;
  visibility?: ListingVisibility;
  price?: number;
  currency?: string;
  tags?: string[];
  configurationSchema?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateListingInput {
  name?: string;
  description?: string;
  version?: string;
  category?: string;
  visibility?: ListingVisibility;
  price?: number;
  currency?: string;
  tags?: string[];
  configurationSchema?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status?: ListingStatus;
}

export interface ListingListOptions {
  developerId?: string;
  status?: ListingStatus;
  category?: string;
  visibility?: ListingVisibility;
}
