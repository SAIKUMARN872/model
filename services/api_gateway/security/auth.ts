import type {
  JwtPayload,
} from "../authentication/jwt.js";

export function authenticate(
  token: string,
  verifier: {
    verify(token: string): JwtPayload;
  },
): JwtPayload {
  if (!token.trim()) {
    throw new Error("Authentication token is required");
  }

  return verifier.verify(token);
}
