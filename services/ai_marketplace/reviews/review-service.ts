import {
  ConflictError,
  NotFoundError,
  ValidationError
} from "../shared/errors.js";
import { generateId, now } from "../shared/utils.js";
import { ReviewRepository } from "./review-repository.js";
import type {
  CreateReviewInput,
  MarketplaceReview,
  ReviewListOptions,
  UpdateReviewInput
} from "./review-schema.js";

export class ReviewService {
  constructor(
    private readonly repository: ReviewRepository =
      new ReviewRepository()
  ) {}

  async create(input: CreateReviewInput): Promise<MarketplaceReview> {
    if (!input.listingId?.trim()) {
      throw new ValidationError("listingId is required");
    }

    if (!input.reviewerId?.trim()) {
      throw new ValidationError("reviewerId is required");
    }

    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new ValidationError("rating must be an integer from 1 to 5");
    }

    if (!input.comment?.trim()) {
      throw new ValidationError("comment is required");
    }

    const existing = await this.repository.findByReviewerAndListing(
      input.reviewerId,
      input.listingId
    );

    if (existing) {
      throw new ConflictError(
        "A reviewer can only have one active review per listing"
      );
    }

    const timestamp = now();

    const review: MarketplaceReview = {
      id: generateId("review"),
      listingId: input.listingId.trim(),
      reviewerId: input.reviewerId.trim(),
      ...(input.installationId
        ? { installationId: input.installationId.trim() }
        : {}),
      rating: input.rating,
      ...(input.title?.trim() ? { title: input.title.trim() } : {}),
      comment: input.comment.trim(),
      status: "published",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return this.repository.create(review);
  }

  async getById(id: string): Promise<MarketplaceReview> {
    const review = await this.repository.getById(id);

    if (!review) {
      throw new NotFoundError(`Review ${id} not found`);
    }

    return review;
  }

  async list(
    options: ReviewListOptions = {}
  ): Promise<MarketplaceReview[]> {
    return this.repository.list(options);
  }

  async update(
    id: string,
    input: UpdateReviewInput
  ): Promise<MarketplaceReview> {
    const review = await this.getById(id);

    if (review.status === "removed") {
      throw new ConflictError("Removed reviews cannot be updated");
    }

    if (
      input.rating !== undefined &&
      (!Number.isInteger(input.rating) ||
        input.rating < 1 ||
        input.rating > 5)
    ) {
      throw new ValidationError("rating must be an integer from 1 to 5");
    }

    if (input.comment !== undefined && !input.comment.trim()) {
      throw new ValidationError("comment cannot be empty");
    }

    const updated = await this.repository.update(id, input);

    if (!updated) {
      throw new NotFoundError(`Review ${id} not found`);
    }

    return updated;
  }

  async respond(
    id: string,
    response: string
  ): Promise<MarketplaceReview> {
    if (!response?.trim()) {
      throw new ValidationError("developer response is required");
    }

    return this.update(id, {
      developerResponse: response.trim()
    });
  }

  async hide(id: string): Promise<MarketplaceReview> {
    const review = await this.getById(id);

    if (review.status === "removed") {
      throw new ConflictError("Removed reviews cannot be hidden");
    }

    return this.update(id, { status: "hidden" });
  }

  async publish(id: string): Promise<MarketplaceReview> {
    const review = await this.getById(id);

    if (review.status === "removed") {
      throw new ConflictError("Removed reviews cannot be published");
    }

    return this.update(id, { status: "published" });
  }

  async remove(id: string): Promise<MarketplaceReview> {
    const review = await this.getById(id);

    if (review.status === "removed") {
      return review;
    }

    return this.update(id, { status: "removed" });
  }

  async delete(id: string): Promise<void> {
    const review = await this.getById(id);

    if (review.status === "published") {
      throw new ConflictError(
        "Published reviews should be removed before deletion"
      );
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Review ${id} not found`);
    }
  }
}
