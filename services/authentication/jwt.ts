import {
  JwtService,
  jwt as defaultJwtService,
} from "../auth/jwt/jwt.js";

export interface AuthenticationJwtPayload {
  sub: string;
  email: string;
  roles: string[];
  [key: string]: unknown;
}

export class AuthenticationJwtService {
  private readonly jwtService: JwtService;

  constructor(
    service: JwtService = defaultJwtService,
  ) {
    this.jwtService = service;
  }

  sign(
    userId: string,
    email: string,
    roles: string[] = [],
    expiresInSeconds = 3600,
  ): string {
    if (!userId.trim()) {
      throw new Error("User ID is required");
    }

    if (!email.trim()) {
      throw new Error("Email is required");
    }

    const service = new JwtService({
      secret:
        process.env.JWT_SECRET ??
        "development-secret-key-123456",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      expiresInSeconds,
    });

    return service.sign({
      sub: userId,
      email,
      roles,
    });
  }

  decode(token: string): AuthenticationJwtPayload {
    if (!token.trim()) {
      throw new Error("Token is required");
    }

    return this.jwtService.decode(
      token,
    ).payload as AuthenticationJwtPayload;
  }

  verify(token: string): AuthenticationJwtPayload {
    if (!token.trim()) {
      throw new Error("Token is required");
    }

    const result = this.jwtService.verify(token);

    if (!result.valid || !result.payload) {
      throw new Error(
        result.error ?? "Invalid JWT",
      );
    }

    return result.payload as AuthenticationJwtPayload;
  }

  isValid(token: string): boolean {
    if (!token.trim()) {
      return false;
    }

    return this.jwtService.isValid(token);
  }
}

export const authenticationJwtService =
  new AuthenticationJwtService();
