import { randomUUID } from "node:crypto";

export interface RepositoryProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileRepositoryInput {
  userId: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProfileRepositoryInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

export interface ProfileRepositoryHealth {
  healthy: boolean;
  total: number;
}

function cloneProfile(
  profile: RepositoryProfile,
): RepositoryProfile {
  return {
    ...profile,
    metadata: {
      ...profile.metadata,
    },
    createdAt: new Date(profile.createdAt),
    updatedAt: new Date(profile.updatedAt),
  };
}

export class ProfileRepository {
  private readonly profiles = new Map<
    string,
    RepositoryProfile
  >();

  create(
    input: CreateProfileRepositoryInput,
  ): RepositoryProfile {
    if (!input.userId?.trim()) {
      throw new Error("User ID is required");
    }

    if (!input.firstName?.trim()) {
      throw new Error("First name is required");
    }

    if (this.findByUserId(input.userId)) {
      throw new Error(
        `Profile already exists for user: ${input.userId}`,
      );
    }

    const now = new Date();

    const profile: RepositoryProfile = {
      id: randomUUID(),
      userId: input.userId,
      firstName: input.firstName.trim(),
      lastName: input.lastName?.trim(),
      displayName: input.displayName?.trim(),
      phone: input.phone?.trim(),
      avatarUrl: input.avatarUrl?.trim(),
      bio: input.bio?.trim(),
      metadata: {
        ...(input.metadata ?? {}),
      },
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(profile.id, profile);

    return cloneProfile(profile);
  }

  findById(
    id: string,
  ): RepositoryProfile | undefined {
    const profile = this.profiles.get(id);

    return profile ? cloneProfile(profile) : undefined;
  }

  findRequiredById(id: string): RepositoryProfile {
    const profile = this.findById(id);

    if (!profile) {
      throw new Error(`Profile not found: ${id}`);
    }

    return profile;
  }

  findByUserId(
    userId: string,
  ): RepositoryProfile | undefined {
    for (const profile of this.profiles.values()) {
      if (profile.userId === userId) {
        return cloneProfile(profile);
      }
    }

    return undefined;
  }

  findAll(): RepositoryProfile[] {
    return Array.from(this.profiles.values()).map(
      cloneProfile,
    );
  }

  update(
    id: string,
    input: UpdateProfileRepositoryInput,
  ): RepositoryProfile {
    const profile = this.profiles.get(id);

    if (!profile) {
      throw new Error(`Profile not found: ${id}`);
    }

    if (input.firstName !== undefined) {
      if (!input.firstName.trim()) {
        throw new Error("First name cannot be empty");
      }

      profile.firstName = input.firstName.trim();
    }

    if (input.lastName !== undefined) {
      profile.lastName = input.lastName.trim();
    }

    if (input.displayName !== undefined) {
      profile.displayName = input.displayName.trim();
    }

    if (input.phone !== undefined) {
      profile.phone = input.phone.trim();
    }

    if (input.avatarUrl !== undefined) {
      profile.avatarUrl = input.avatarUrl.trim();
    }

    if (input.bio !== undefined) {
      profile.bio = input.bio.trim();
    }

    if (input.metadata !== undefined) {
      profile.metadata = {
        ...profile.metadata,
        ...input.metadata,
      };
    }

    profile.updatedAt = new Date();

    return cloneProfile(profile);
  }

  replaceMetadata(
    id: string,
    metadata: Record<string, unknown>,
  ): RepositoryProfile {
    const profile = this.profiles.get(id);

    if (!profile) {
      throw new Error(`Profile not found: ${id}`);
    }

    profile.metadata = {
      ...metadata,
    };

    profile.updatedAt = new Date();

    return cloneProfile(profile);
  }

  delete(id: string): boolean {
    return this.profiles.delete(id);
  }

  exists(id: string): boolean {
    return this.profiles.has(id);
  }

  count(): number {
    return this.profiles.size;
  }

  clear(): void {
    this.profiles.clear();
  }

  health(): ProfileRepositoryHealth {
    return {
      healthy: true,
      total: this.profiles.size,
    };
  }
}

export const profileRepository =
  new ProfileRepository();
