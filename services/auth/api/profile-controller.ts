import {
  userService,
  type User,
  type UpdateUserInput,
} from "../users/user.js";

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface ProfileApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ProfileController {
  getProfile(
    userId: string,
  ): ProfileApiResponse<ProfileResponse> {
    try {
      const user = userService.getById(userId);

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        data: this.toProfile(user),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  updateProfile(
    userId: string,
    input: UpdateUserInput,
  ): ProfileApiResponse<ProfileResponse> {
    try {
      const user = userService.update(userId, input);

      return {
        success: true,
        data: this.toProfile(user),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  updateName(
    userId: string,
    name: string,
  ): ProfileApiResponse<ProfileResponse> {
    return this.updateProfile(userId, {
      name,
    });
  }

  updateEmail(
    userId: string,
    email: string,
  ): ProfileApiResponse<ProfileResponse> {
    return this.updateProfile(userId, {
      email,
    });
  }

  updateMetadata(
    userId: string,
    metadata: Record<string, unknown>,
  ): ProfileApiResponse<ProfileResponse> {
    return this.updateProfile(userId, {
      metadata,
    });
  }

  addRole(
    userId: string,
    role: string,
  ): ProfileApiResponse<ProfileResponse> {
    try {
      const user = userService.addRole(userId, role);

      return {
        success: true,
        data: this.toProfile(user),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  removeRole(
    userId: string,
    role: string,
  ): ProfileApiResponse<ProfileResponse> {
    try {
      const user = userService.removeRole(userId, role);

      return {
        success: true,
        data: this.toProfile(user),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  recordLogin(
    userId: string,
  ): ProfileApiResponse<ProfileResponse> {
    try {
      const user = userService.recordLogin(userId);

      return {
        success: true,
        data: this.toProfile(user),
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  private toProfile(user: User): ProfileResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: [...user.roles],
      metadata: { ...user.metadata },
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      ...(user.lastLoginAt
        ? {
            lastLoginAt: new Date(user.lastLoginAt),
          }
        : {}),
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error";
  }
}

export const profileController =
  new ProfileController();
