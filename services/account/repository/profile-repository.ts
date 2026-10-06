import type {
  Profile,
  UpdateProfileInput,
} from "../schemas/profile-schema.js";

export interface ProfileRepository {
  create(accountId: string, displayName: string): Promise<Profile>;
  findByAccountId(accountId: string): Promise<Profile | null>;
  update(
    accountId: string,
    input: UpdateProfileInput,
  ): Promise<Profile | null>;
  delete(accountId: string): Promise<boolean>;
}

export class InMemoryProfileRepository implements ProfileRepository {
  private readonly profiles = new Map<string, Profile>();

  async create(
    accountId: string,
    displayName: string,
  ): Promise<Profile> {
    const now = new Date().toISOString();

    const profile: Profile = {
      accountId,
      displayName,
      avatar: null,
      timezone: "UTC",
      preferences: {},
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(accountId, profile);

    return { ...profile };
  }

  async findByAccountId(accountId: string): Promise<Profile | null> {
    const profile = this.profiles.get(accountId);

    return profile ? { ...profile } : null;
  }

  async update(
    accountId: string,
    input: UpdateProfileInput,
  ): Promise<Profile | null> {
    const existing = this.profiles.get(accountId);

    if (!existing) {
      return null;
    }

    const updated: Profile = {
      ...existing,
      ...input,
      preferences: input.preferences
        ? { ...existing.preferences, ...input.preferences }
        : existing.preferences,
      metadata: input.metadata
        ? { ...existing.metadata, ...input.metadata }
        : existing.metadata,
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(accountId, updated);

    return { ...updated };
  }

  async delete(accountId: string): Promise<boolean> {
    return this.profiles.delete(accountId);
  }
}
