import type {
  MarketplaceReview,
  ReviewListOptions,
  UpdateReviewInput
} from "./review-schema.js";

export class ReviewRepository {
  private readonly reviews = new Map<string, MarketplaceReview>();

  async create(review: MarketplaceReview): Promise<MarketplaceReview> {
    this.reviews.set(review.id, review);
    return structuredClone(review);
  }

  async getById(id: string): Promise<MarketplaceReview | undefined> {
    const review = this.reviews.get(id);
    return review ? structuredClone(review) : undefined;
  }

  async findByReviewerAndListing(
    reviewerId: string,
    listingId: string
  ): Promise<MarketplaceReview | undefined> {
    for (const review of this.reviews.values()) {
      if (
        review.reviewerId === reviewerId &&
        review.listingId === listingId &&
        review.status !== "removed"
      ) {
        return structuredClone(review);
      }
    }

    return undefined;
  }

  async list(
    options: ReviewListOptions = {}
  ): Promise<MarketplaceReview[]> {
    return [...this.reviews.values()]
      .filter((review) => {
        if (options.listingId && review.listingId !== options.listingId) {
          return false;
        }

        if (
          options.reviewerId &&
          review.reviewerId !== options.reviewerId
        ) {
          return false;
        }

        if (options.rating !== undefined && review.rating !== options.rating) {
          return false;
        }

        if (options.status && review.status !== options.status) {
          return false;
        }

        return true;
      })
      .map((review) => structuredClone(review));
  }

  async update(
    id: string,
    input: UpdateReviewInput
  ): Promise<MarketplaceReview | undefined> {
    const review = this.reviews.get(id);

    if (!review) {
      return undefined;
    }

    const updated: MarketplaceReview = {
      ...review,
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.comment !== undefined
        ? { comment: input.comment }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.developerResponse !== undefined
        ? { developerResponse: input.developerResponse }
        : {}),
      updatedAt: new Date()
    };

    this.reviews.set(id, updated);

    return structuredClone(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async clear(): Promise<void> {
    this.reviews.clear();
  }
}
