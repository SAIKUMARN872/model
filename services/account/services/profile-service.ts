
import { randomUUID } from "node:crypto";

import type { ServiceResult } from "./account-service.js";

type ProfileSchema = {
  id: string;
  userId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

type CreateProfileSchema = Omit<ProfileSchema, "id" | "createdAt" | "updatedAt"> & {
  metadata?: Record<string, unknown>;
};

type UpdateProfileSchema = Partial<
  Omit<ProfileSchema, "id" | "userId" | "createdAt" | "updatedAt">
>;

type ProfileValidation<T> = {
  valid: boolean;
  data?: T;
  errors: Array<{ field: string; message: string }>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCreateProfile(input: CreateProfileSchema): ProfileValidation<CreateProfileSchema> {
  const errors: Array<{ field: string; message: string }> = [];
  if (typeof input.userId !== "string" || !input.userId.trim()) {
    errors.push({ field: "userId", message: "A valid user ID is required." });
  }
  if (input.metadata !== undefined && !isObject(input.metadata)) {
    errors.push({ field: "metadata", message: "Metadata must be an object." });
  }
  return { valid: errors.length === 0, data: errors.length === 0 ? input : undefined, errors };
}

function validateUpdateProfile(input: UpdateProfileSchema): ProfileValidation<UpdateProfileSchema> {
  const errors: Array<{ field: string; message: string }> = [];
  if (!isObject(input)) {
    errors.push({ field: "profile", message: "Profile updates must be an object." });
  } else if (input.metadata !== undefined && !isObject(input.metadata)) {
    errors.push({ field: "metadata", message: "Metadata must be an object." });
  }
  return { valid: errors.length === 0, data: errors.length === 0 ? input : undefined, errors };
}

function cloneProfile(profile: ProfileSchema): ProfileSchema {
  return {
    ...profile,
    metadata: structuredClone(profile.metadata),
    createdAt: new Date(profile.createdAt),
    updatedAt: new Date(profile.updatedAt),
  };
}

function failure<T>(
  code: string,
  message: string,
): ServiceResult<T> {
  return {
    success: false,
    error: { code, message },
  };
}

export class ProfileService {
  private readonly profiles = new Map<string, ProfileSchema>();

  /**
   * Create a new user profile.
   */
  async create(
    input: CreateProfileSchema,
  ): Promise<ServiceResult<ProfileSchema>> {
    const validation = validateCreateProfile(input);

    if (!validation.valid || !validation.data) {
      return failure(
        "VALIDATION_ERROR",
        validation.errors
          .map((error: { field: string; message: string }) => `${error.field}: ${error.message}`)
          .join("; "),
      );
    }

    const data = validation.data;

    const existing = [...this.profiles.values()].find(
      (profile) => profile.userId === data.userId,
    );

    if (existing) {
      return failure(
        "PROFILE_ALREADY_EXISTS",
        "A profile already exists for this user.",
      );
    }

    const now = new Date();

    const profile: ProfileSchema = {
      ...data,
      userId: data.userId,
      id: randomUUID(),
      metadata: structuredClone(data.metadata ?? {}),
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(profile.id, profile);

    return {
      success: true,
      data: cloneProfile(profile),
    };
  }

  /**
   * Retrieve profile by ID.
   */
  async getById(
    id: string,
  ): Promise<ServiceResult<ProfileSchema>> {
    if (!id?.trim()) {
      return failure("INVALID_ID", "A valid profile ID is required.");
    }

    const profile = this.profiles.get(id.trim());

    if (!profile) {
      return failure("PROFILE_NOT_FOUND", "Profile was not found.");
    }

    return {
      success: true,
      data: cloneProfile(profile),
    };
  }

  /**
   * Retrieve profile by user ID.
   */
  async getByUserId(
    userId: string,
  ): Promise<ServiceResult<ProfileSchema>> {
    if (!userId?.trim()) {
      return failure(
        "INVALID_USER_ID",
        "A valid user ID is required.",
      );
    }

    const profile = [...this.profiles.values()].find(
      (item) => item.userId === userId.trim(),
    );

    if (!profile) {
      return failure("PROFILE_NOT_FOUND", "Profile was not found.");
    }

    return {
      success: true,
      data: cloneProfile(profile),
    };
  }

  /**
   * Retrieve all profiles.
   */
  async list(): Promise<ServiceResult<ProfileSchema[]>> {
    return {
      success: true,
      data: [...this.profiles.values()].map(cloneProfile),
    };
  }

  /**
   * Update an existing profile.
   */
  async update(
    id: string,
    input: UpdateProfileSchema,
  ): Promise<ServiceResult<ProfileSchema>> {
    if (!id?.trim()) {
      return failure("INVALID_ID", "A valid profile ID is required.");
    }

    const profileId = id.trim();
    const existing = this.profiles.get(profileId);

    if (!existing) {
      return failure("PROFILE_NOT_FOUND", "Profile was not found.");
    }

    const validation = validateUpdateProfile(input);

    if (!validation.valid || !validation.data) {
      return failure(
        "VALIDATION_ERROR",
        validation.errors
          .map((error: { field: string; message: string }) => `${error.field}: ${error.message}`)
          .join("; "),
      );
    }

    const updates: UpdateProfileSchema = validation.data;

    const updated: ProfileSchema = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: existing.userId,
      metadata:
        updates.metadata !== undefined
          ? { ...existing.metadata, ...updates.metadata }
          : { ...existing.metadata },
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.profiles.set(profileId, updated);

    return {
      success: true,
      data: cloneProfile(updated),
    };
  }

  /**
   * Delete a profile.
   */
  async delete(
    id: string,
  ): Promise<ServiceResult<boolean>> {
    if (!id?.trim()) {
      return failure("INVALID_ID", "A valid profile ID is required.");
    }

    const profileId = id.trim();

    if (!this.profiles.has(profileId)) {
      return failure("PROFILE_NOT_FOUND", "Profile was not found.");
    }

    this.profiles.delete(profileId);

    return {
      success: true,
      data: true,
    };
  }

  /**
   * Check profile existence.
   */
  async exists(id: string): Promise<boolean> {
    if (!id?.trim()) {
      return false;
    }

    return this.profiles.has(id.trim());
  }

  /**
   * Return total profiles.
   */
  async count(): Promise<number> {
    return this.profiles.size;
  }

  /**
   * Clear profiles. Intended for tests and controlled maintenance.
   */
  async clear(): Promise<void> {
    this.profiles.clear();
  }

  /**
   * Service health check.
   */
  async healthCheck(): Promise<
    ServiceResult<{ status: "healthy"; totalProfiles: number }>
  > {
    return {
      success: true,
      data: {
        status: "healthy",
        totalProfiles: this.profiles.size,
      },
    };
  }
}

export const profileService = new ProfileService();