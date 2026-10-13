import type {
  PublishingListOptions,
  PublishingRequest,
  UpdatePublishingInput
} from "./publishing-schema.js";

export class PublishingRepository {
  private readonly requests = new Map<string, PublishingRequest>();

  async create(request: PublishingRequest): Promise<PublishingRequest> {
    this.requests.set(request.id, request);
    return structuredClone(request);
  }

  async getById(id: string): Promise<PublishingRequest | undefined> {
    const request = this.requests.get(id);
    return request ? structuredClone(request) : undefined;
  }

  async list(
    options: PublishingListOptions = {}
  ): Promise<PublishingRequest[]> {
    return [...this.requests.values()]
      .filter((request) => {
        if (
          options.listingId &&
          request.listingId !== options.listingId
        ) {
          return false;
        }

        if (
          options.developerId &&
          request.developerId !== options.developerId
        ) {
          return false;
        }

        if (options.status && request.status !== options.status) {
          return false;
        }

        return true;
      })
      .map((request) => structuredClone(request));
  }

  async update(
    id: string,
    input: UpdatePublishingInput
  ): Promise<PublishingRequest | undefined> {
    const request = this.requests.get(id);

    if (!request) {
      return undefined;
    }

    const updated: PublishingRequest = {
      ...request,
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.reviewer !== undefined
        ? { reviewer: input.reviewer }
        : {}),
      ...(input.reviewNotes !== undefined
        ? { reviewNotes: input.reviewNotes }
        : {}),
      updatedAt: new Date()
    };

    if (
      ["approved", "rejected", "published", "cancelled"].includes(
        updated.status
      ) &&
      !updated.completedAt
    ) {
      updated.completedAt = new Date();
    }

    this.requests.set(id, updated);

    return structuredClone(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.requests.delete(id);
  }

  async clear(): Promise<void> {
    this.requests.clear();
  }
}
