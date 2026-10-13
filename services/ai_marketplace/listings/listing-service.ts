import {
  ConflictError,
  NotFoundError,
  ValidationError
} from "../shared/errors.js";
import { generateId, now } from "../shared/utils.js";
import { ListingRepository } from "./listing-repository.js";
import type {
  CreateListingInput,
  ListingListOptions,
  MarketplaceListing,
  UpdateListingInput
} from "./listing-schema.js";

export class ListingService {
  constructor(
    private readonly repository: ListingRepository =
      new ListingRepository()
  ) {}

  async create(input: CreateListingInput): Promise<MarketplaceListing> {
    if (!input.developerId?.trim()) {
      throw new ValidationError("developerId is required");
    }

    if (!input.name?.trim()) {
      throw new ValidationError("name is required");
    }

    if (!input.slug?.trim()) {
      throw new ValidationError("slug is required");
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim())) {
      throw new ValidationError(
        "slug must contain lowercase letters, numbers and hyphens"
      );
    }

    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError("price cannot be negative");
    }

    const existing = await this.repository.getBySlug(input.slug.trim());

    if (existing) {
      throw new ConflictError(
        `A listing with slug "${input.slug}" already exists`
      );
    }

    const timestamp = now();

    const listing: MarketplaceListing = {
      id: generateId("listing"),
      developerId: input.developerId.trim(),
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: input.description?.trim() || "",
      version: input.version?.trim() || "1.0.0",
      category: input.category?.trim() || "general",
      status: "draft",
      visibility: input.visibility ?? "public",
      price: input.price ?? 0,
      currency: input.currency?.trim().toUpperCase() || "USD",
      tags: [...(input.tags ?? [])],
      configurationSchema: structuredClone(
        input.configurationSchema ?? {}
      ),
      metadata: structuredClone(input.metadata ?? {}),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    if (!/^[A-Z]{3}$/.test(listing.currency)) {
      throw new ValidationError("currency must be a 3-letter code");
    }

    return this.repository.create(listing);
  }

  async getById(id: string): Promise<MarketplaceListing> {
    const listing = await this.repository.getById(id);

    if (!listing) {
      throw new NotFoundError(`Listing ${id} not found`);
    }

    return listing;
  }

  async getBySlug(slug: string): Promise<MarketplaceListing> {
    const listing = await this.repository.getBySlug(slug);

    if (!listing) {
      throw new NotFoundError(`Listing ${slug} not found`);
    }

    return listing;
  }

  async list(
    options: ListingListOptions = {}
  ): Promise<MarketplaceListing[]> {
    return this.repository.list(options);
  }

  async update(
    id: string,
    input: UpdateListingInput
  ): Promise<MarketplaceListing> {
    const listing = await this.getById(id);

    if (listing.status === "archived") {
      throw new ConflictError("Archived listings cannot be updated");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new ValidationError("name cannot be empty");
    }

    if (input.version !== undefined && !input.version.trim()) {
      throw new ValidationError("version cannot be empty");
    }

    if (input.price !== undefined && input.price < 0) {
      throw new ValidationError("price cannot be negative");
    }

    if (input.status === "published" && listing.status === "draft") {
      throw new ConflictError(
        "Listings must pass publishing workflow before publication"
      );
    }

    const updated = await this.repository.update(id, input);

    if (!updated) {
      throw new NotFoundError(`Listing ${id} not found`);
    }

    return updated;
  }

  async submitForReview(id: string): Promise<MarketplaceListing> {
    const listing = await this.getById(id);

    if (listing.status !== "draft") {
      throw new ConflictError(
        "Only draft listings can be submitted for review"
      );
    }

    const updated = await this.repository.update(id, {
      status: "pending_review"
    });

    if (!updated) {
      throw new NotFoundError(`Listing ${id} not found`);
    }

    return updated;
  }

  async publish(id: string): Promise<MarketplaceListing> {
    const listing = await this.getById(id);

    if (listing.status !== "pending_review") {
      throw new ConflictError(
        "Only listings pending review can be published"
      );
    }

    const updated = await this.repository.update(id, {
      status: "published"
    });

    if (!updated) {
      throw new NotFoundError(`Listing ${id} not found`);
    }

    return updated;
  }

  async suspend(id: string): Promise<MarketplaceListing> {
    const listing = await this.getById(id);

    if (listing.status !== "published") {
      throw new ConflictError(
        "Only published listings can be suspended"
      );
    }

    const updated = await this.repository.update(id, {
      status: "suspended"
    });

    if (!updated) {
      throw new NotFoundError(`Listing ${id} not found`);
    }

    return updated;
  }

  async archive(id: string): Promise<MarketplaceListing> {
    const listing = await this.getById(id);

    if (listing.status === "archived") {
      return listing;
    }

    const updated = await this.repository.update(id, {
      status: "archived"
    });

    if (!updated) {
      throw new NotFoundError(`Listing ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const listing = await this.getById(id);

    if (listing.status === "published") {
      throw new ConflictError(
        "Published listings must be archived before deletion"
      );
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Listing ${id} not found`);
    }
  }
}
