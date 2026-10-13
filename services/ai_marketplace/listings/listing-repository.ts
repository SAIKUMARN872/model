import type {
  ListingListOptions,
  MarketplaceListing,
  UpdateListingInput
} from "./listing-schema.js";

export class ListingRepository {
  private readonly listings = new Map<string, MarketplaceListing>();

  async create(listing: MarketplaceListing): Promise<MarketplaceListing> {
    this.listings.set(listing.id, listing);
    return structuredClone(listing);
  }

  async getById(id: string): Promise<MarketplaceListing | undefined> {
    const listing = this.listings.get(id);
    return listing ? structuredClone(listing) : undefined;
  }

  async getBySlug(slug: string): Promise<MarketplaceListing | undefined> {
    for (const listing of this.listings.values()) {
      if (listing.slug === slug) {
        return structuredClone(listing);
      }
    }

    return undefined;
  }

  async list(
    options: ListingListOptions = {}
  ): Promise<MarketplaceListing[]> {
    return [...this.listings.values()]
      .filter((listing) => {
        if (
          options.developerId &&
          listing.developerId !== options.developerId
        ) {
          return false;
        }

        if (options.status && listing.status !== options.status) {
          return false;
        }

        if (options.category && listing.category !== options.category) {
          return false;
        }

        if (
          options.visibility &&
          listing.visibility !== options.visibility
        ) {
          return false;
        }

        return true;
      })
      .map((listing) => structuredClone(listing));
  }

  async update(
    id: string,
    input: UpdateListingInput
  ): Promise<MarketplaceListing | undefined> {
    const listing = this.listings.get(id);

    if (!listing) {
      return undefined;
    }

    const updated: MarketplaceListing = {
      ...listing,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.version !== undefined ? { version: input.version } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.visibility !== undefined
        ? { visibility: input.visibility }
        : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.currency !== undefined
        ? { currency: input.currency }
        : {}),
      ...(input.tags !== undefined
        ? { tags: structuredClone(input.tags) }
        : {}),
      ...(input.configurationSchema !== undefined
        ? {
            configurationSchema: structuredClone(
              input.configurationSchema
            )
          }
        : {}),
      ...(input.metadata !== undefined
        ? { metadata: structuredClone(input.metadata) }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date()
    };

    if (updated.status === "published" && !updated.publishedAt) {
      updated.publishedAt = new Date();
    }

    this.listings.set(id, updated);

    return structuredClone(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.listings.delete(id);
  }

  async clear(): Promise<void> {
    this.listings.clear();
  }
}
