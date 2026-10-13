import type {
  Installation,
  InstallationListOptions,
  UpdateInstallationInput
} from "./installation-schema.js";

export class InstallationRepository {
  private readonly installations = new Map<string, Installation>();

  async create(installation: Installation): Promise<Installation> {
    this.installations.set(installation.id, installation);
    return structuredClone(installation);
  }

  async getById(id: string): Promise<Installation | undefined> {
    const installation = this.installations.get(id);
    return installation ? structuredClone(installation) : undefined;
  }

  async findByTenantAndListing(
    tenantId: string,
    listingId: string
  ): Promise<Installation | undefined> {
    for (const installation of this.installations.values()) {
      if (
        installation.tenantId === tenantId &&
        installation.listingId === listingId &&
        installation.status !== "uninstalled"
      ) {
        return structuredClone(installation);
      }
    }

    return undefined;
  }

  async list(
    options: InstallationListOptions = {}
  ): Promise<Installation[]> {
    return [...this.installations.values()]
      .filter((installation) => {
        if (
          options.tenantId &&
          installation.tenantId !== options.tenantId
        ) {
          return false;
        }

        if (
          options.listingId &&
          installation.listingId !== options.listingId
        ) {
          return false;
        }

        if (
          options.developerId &&
          installation.developerId !== options.developerId
        ) {
          return false;
        }

        if (options.status && installation.status !== options.status) {
          return false;
        }

        return true;
      })
      .map((installation) => structuredClone(installation));
  }

  async update(
    id: string,
    input: UpdateInstallationInput
  ): Promise<Installation | undefined> {
    const installation = this.installations.get(id);

    if (!installation) {
      return undefined;
    }

    const updated: Installation = {
      ...installation,
      ...(input.version !== undefined ? { version: input.version } : {}),
      ...(input.configuration !== undefined
        ? { configuration: structuredClone(input.configuration) }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date()
    };

    if (updated.status === "uninstalled" && !updated.uninstalledAt) {
      updated.uninstalledAt = new Date();
    }

    this.installations.set(id, updated);

    return structuredClone(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.installations.delete(id);
  }

  async clear(): Promise<void> {
    this.installations.clear();
  }
}
