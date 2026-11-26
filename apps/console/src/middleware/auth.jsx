import { AuthService } from "../auth/AuthService.jsx";

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "AuthenticationRequiredError";
    this.code = "AUTHENTICATION_REQUIRED";
  }
}

export async function requireAuthenticatedSession() {
  try {
    const session = await AuthService.getSession();

    if (!session?.authenticated || !session.user) {
      throw new AuthenticationRequiredError();
    }

    return session;
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) throw error;

    const wrapped = new AuthenticationRequiredError(
      "The authenticated session could not be verified."
    );
    wrapped.cause = error;
    throw wrapped;
  }
}

export function isAuthenticationError(error) {
  return error?.name === "AuthenticationRequiredError" ||
    error?.status === 401 ||
    error?.code === "AUTHENTICATION_REQUIRED";
}
