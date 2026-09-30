export interface AuthRequest {
  headers?: Record<string, string | undefined>;
  user?: AuthUser;
  path?: string;
  method?: string;
}

export interface AuthUser {
  id: string;
  roles: string[];
  authenticated: boolean;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthUser;
  message: string;
}

export type TokenValidator = (
  token: string,
) => AuthUser | undefined;

export class AuthMiddleware {
  private validator?: TokenValidator;

  constructor(validator?: TokenValidator) {
    this.validator = validator;
  }

  setValidator(validator: TokenValidator): void {
    this.validator = validator;
  }

  authenticate(request: AuthRequest): AuthResult {
    const authorization =
      request.headers?.authorization ??
      request.headers?.Authorization;

    if (!authorization) {
      return {
        authenticated: false,
        message: "Authorization header is required",
      };
    }

    if (!authorization.startsWith("Bearer ")) {
      return {
        authenticated: false,
        message: "Bearer token is required",
      };
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return {
        authenticated: false,
        message: "Authentication token is empty",
      };
    }

    if (!this.validator) {
      return {
        authenticated: false,
        message: "Token validator is not configured",
      };
    }

    const user = this.validator(token);

    if (!user) {
      return {
        authenticated: false,
        message: "Invalid authentication token",
      };
    }

    const authenticatedUser: AuthUser = {
      ...user,
      authenticated: true,
      roles: [...user.roles],
    };

    request.user = authenticatedUser;

    return {
      authenticated: true,
      user: authenticatedUser,
      message: "Authentication successful",
    };
  }

  requireRole(
    request: AuthRequest,
    role: string,
  ): boolean {
    if (!request.user?.authenticated) {
      return false;
    }

    return request.user.roles.includes(role);
  }

  requireAnyRole(
    request: AuthRequest,
    roles: string[],
  ): boolean {
    if (!request.user?.authenticated) {
      return false;
    }

    return roles.some((role) =>
      request.user?.roles.includes(role),
    );
  }

  isAuthenticated(
    request: AuthRequest,
  ): boolean {
    return request.user?.authenticated === true;
  }
}

export const authMiddleware =
  new AuthMiddleware();
