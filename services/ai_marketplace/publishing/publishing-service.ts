import {
  ConflictError,
  NotFoundError,
  ValidationError
} from "../shared/errors.js";
import { generateId, now } from "../shared/utils.js";
import { PublishingRepository } from "./publishing-repository.js";
import type {
  CreatePublishingInput,
  PublishingListOptions,
  PublishingRequest,
  UpdatePublishingInput
} from "./publishing-schema.js";

export class PublishingService {
  constructor(
    private readonly repository: PublishingRepository =
      new PublishingRepository()
  ) {}

  async create(
    input: CreatePublishingInput
  ): Promise<PublishingRequest> {
    if (!input.listingId?.trim()) {
      throw new ValidationError("listingId is required");
    }

    if (!input.developerId?.trim()) {
      throw new ValidationError("developerId is required");
    }

    if (!input.submittedBy?.trim()) {
      throw new ValidationError("submittedBy is required");
    }

    if (!input.version?.trim()) {
      throw new ValidationError("version is required");
    }

    const existing = await this.repository.list({
      listingId: input.listingId
    });

    const openRequest = existing.find(
      (request) =>
        !["rejected", "cancelled", "published"].includes(request.status)
    );

    if (openRequest) {
      throw new ConflictError(
        "This listing already has an active publishing request"
      );
    }

    const timestamp = now();

    const request: PublishingRequest = {
      id: generateId("publish"),
      listingId: input.listingId.trim(),
      developerId: input.developerId.trim(),
      submittedBy: input.submittedBy.trim(),
      status: "queued",
      version: input.version.trim(),
      notes: input.notes?.trim() || "",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return this.repository.create(request);
  }

  async getById(id: string): Promise<PublishingRequest> {
    const request = await this.repository.getById(id);

    if (!request) {
      throw new NotFoundError(`Publishing request ${id} not found`);
    }

    return request;
  }

  async list(
    options: PublishingListOptions = {}
  ): Promise<PublishingRequest[]> {
    return this.repository.list(options);
  }

  async startReview(id: string): Promise<PublishingRequest> {
    const request = await this.getById(id);

    if (request.status !== "queued") {
      throw new ConflictError(
        "Only queued publishing requests can enter review"
      );
    }

    return this.update(id, { status: "in_review" });
  }

  async approve(
    id: string,
    reviewer: string,
    reviewNotes?: string
  ): Promise<PublishingRequest> {
    if (!reviewer?.trim()) {
      throw new ValidationError("reviewer is required");
    }

    const request = await this.getById(id);

    if (request.status !== "in_review") {
      throw new ConflictError(
        "Only requests in review can be approved"
      );
    }

    return this.update(id, {
      status: "approved",
      reviewer: reviewer.trim(),
      ...(reviewNotes !== undefined ? { reviewNotes } : {})
    });
  }

  async reject(
    id: string,
    reviewer: string,
    reviewNotes: string
  ): Promise<PublishingRequest> {
    if (!reviewer?.trim()) {
      throw new ValidationError("reviewer is required");
    }

    if (!reviewNotes?.trim()) {
      throw new ValidationError("reviewNotes is required");
    }

    const request = await this.getById(id);

    if (request.status !== "in_review") {
      throw new ConflictError(
        "Only requests in review can be rejected"
      );
    }

    return this.update(id, {
      status: "rejected",
      reviewer: reviewer.trim(),
      reviewNotes: reviewNotes.trim()
    });
  }

  async publish(id: string): Promise<PublishingRequest> {
    const request = await this.getById(id);

    if (request.status !== "approved") {
      throw new ConflictError(
        "Only approved publishing requests can be published"
      );
    }

    return this.update(id, { status: "published" });
  }

  async cancel(id: string): Promise<PublishingRequest> {
    const request = await this.getById(id);

    if (
      ["published", "cancelled", "rejected"].includes(request.status)
    ) {
      throw new ConflictError(
        "This publishing request cannot be cancelled"
      );
    }

    return this.update(id, { status: "cancelled" });
  }

  async update(
    id: string,
    input: UpdatePublishingInput
  ): Promise<PublishingRequest> {
    const request = await this.getById(id);

    if (
      ["published", "cancelled"].includes(request.status) &&
      input.status !== undefined
    ) {
      throw new ConflictError(
        "Completed publishing requests cannot change status"
      );
    }

    const updated = await this.repository.update(id, input);

    if (!updated) {
      throw new NotFoundError(`Publishing request ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const request = await this.getById(id);

    if (request.status === "published") {
      throw new ConflictError(
        "Published requests cannot be deleted"
      );
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Publishing request ${id} not found`);
    }
  }
}
