import {
  ConflictError,
  NotFoundError,
  ValidationError
} from "../shared/errors.js";
import { generateId, now } from "../shared/utils.js";
import { InstallationRepository } from "./installation-repository.js";
import type {
  CreateInstallationInput,
  Installation,
  InstallationListOptions,
  UpdateInstallationInput
} from "./installation-schema.js";

export class InstallationService {
  constructor(
    private readonly repository: InstallationRepository =
      new InstallationRepository()
  ) {}

  async create(
    input: CreateInstallationInput
  ): Promise<Installation> {
    const required = [
      ["listingId", input.listingId],
      ["developerId", input.developerId],
      ["tenantId", input.tenantId],
      ["installedBy", input.installedBy]
    ] as const;

    for (const [name, value] of required) {
      if (!value?.trim()) {
        throw new ValidationError(`${name} is required`);
      }
    }

    const existing = await this.repository.findByTenantAndListing(
      input.tenantId,
      input.listingId
    );

    if (existing) {
      throw new ConflictError(
        "This listing is already installed for the tenant"
      );
    }

    const timestamp = now();

    const installation: Installation = {
      id: generateId("installation"),
      listingId: input.listingId.trim(),
      developerId: input.developerId.trim(),
      tenantId: input.tenantId.trim(),
      installedBy: input.installedBy.trim(),
      version: input.version?.trim() || "1.0.0",
      status: "pending",
      configuration: structuredClone(input.configuration ?? {}),
      installedAt: timestamp,
      updatedAt: timestamp
    };

    return this.repository.create(installation);
  }

  async getById(id: string): Promise<Installation> {
    const installation = await this.repository.getById(id);

    if (!installation) {
      throw new NotFoundError(`Installation ${id} not found`);
    }

    return installation;
  }

  async list(
    options: InstallationListOptions = {}
  ): Promise<Installation[]> {
    return this.repository.list(options);
  }

  async activate(id: string): Promise<Installation> {
    const installation = await this.getById(id);

    if (installation.status === "uninstalled") {
      throw new ConflictError(
        "An uninstalled installation cannot be activated"
      );
    }

    if (installation.status === "active") {
      return installation;
    }

    const updated = await this.repository.update(id, {
      status: "active"
    });

    if (!updated) {
      throw new NotFoundError(`Installation ${id} not found`);
    }

    return updated;
  }

  async suspend(id: string): Promise<Installation> {
    const installation = await this.getById(id);

    if (installation.status === "uninstalled") {
      throw new ConflictError(
        "An uninstalled installation cannot be suspended"
      );
    }

    const updated = await this.repository.update(id, {
      status: "suspended"
    });

    if (!updated) {
      throw new NotFoundError(`Installation ${id} not found`);
    }

    return updated;
  }

  async uninstall(id: string): Promise<Installation> {
    const installation = await this.getById(id);

    if (installation.status === "uninstalled") {
      return installation;
    }

    const updated = await this.repository.update(id, {
      status: "uninstalled"
    });

    if (!updated) {
      throw new NotFoundError(`Installation ${id} not found`);
    }

    return updated;
  }

  async update(
    id: string,
    input: UpdateInstallationInput
  ): Promise<Installation> {
    const installation = await this.getById(id);

    if (
      installation.status === "uninstalled" &&
      input.status !== undefined &&
      input.status !== "uninstalled"
    ) {
      throw new ConflictError(
        "An uninstalled installation cannot change status"
      );
    }

    if (
      input.version !== undefined &&
      !input.version.trim()
    ) {
      throw new ValidationError("version cannot be empty");
    }

    const updated = await this.repository.update(id, {
      ...input,
      ...(input.status === undefined ? {} : { status: input.status })
    });

    if (!updated) {
      throw new NotFoundError(`Installation ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const installation = await this.getById(id);

    if (installation.status === "active") {
      throw new ConflictError(
        "Active installations must be uninstalled before deletion"
      );
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Installation ${id} not found`);
    }
  }
}
