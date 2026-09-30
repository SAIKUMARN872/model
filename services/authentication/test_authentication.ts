import {
  AuthenticationService,
  authenticationService,
} from "./service.js";

import {
  AuthenticationPasswordService,
} from "./password.js";

import {
  AuthenticationJwtService,
} from "./jwt.js";

import {
  AuthenticationSessionService,
} from "./session.js";

import {
  AuthenticationOAuthService,
} from "./oauth.js";

import {
  UserService,
} from "../auth/users/user.js";

import {
  SessionService,
} from "../auth/sessions/session.js";

import {
  OAuthService,
} from "../auth/oauth/oauth.js";

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
}

console.log("Running authentication tests...");

const users = new UserService();
const sessions = new SessionService();
const oauth = new OAuthService();

const passwordService =
  new AuthenticationPasswordService();

const jwtService =
  new AuthenticationJwtService();

const sessionService =
  new AuthenticationSessionService(sessions);

const oauthService =
  new AuthenticationOAuthService(oauth);

users.clear();
sessions.clear();

authenticationService.clear();

const password = "StrongPassword123!";

const passwordValidation =
  passwordService.validate(password);

assert(
  passwordValidation.valid,
  "Valid password passes validation",
);

const passwordHash =
  passwordService.hash(password);

assert(
  !!passwordHash.hash,
  "Password hash is generated",
);

assert(
  passwordService.verify(password, passwordHash),
  "Correct password is verified",
);

assert(
  !passwordService.verify(
    "WrongPassword123!",
    passwordHash,
  ),
  "Incorrect password is rejected",
);

const user = authenticationService.register({
  email: "john@example.com",
  name: "John Doe",
  password,
  roles: ["user"],
});

assert(
  !!user.id,
  "User is created during registration",
);

assert(
  user.email === "john@example.com",
  "Registered user email is correct",
);

assert(
  user.roles.includes("user"),
  "Default user role is assigned",
);

let duplicateRejected = false;

try {
  authenticationService.register({
    email: "JOHN@example.com",
    name: "Duplicate",
    password,
  });
} catch {
  duplicateRejected = true;
}

assert(
  duplicateRejected,
  "Duplicate registration is rejected",
);

const login =
  authenticationService.login({
    email: "john@example.com",
    password,
  });

assert(
  login.authenticated,
  "Login is successful",
);

assert(
  !!login.accessToken,
  "Access token is generated",
);

assert(
  !!login.sessionToken,
  "Session token is generated",
);

assert(
  !!login.sessionId,
  "Session ID is generated",
);

assert(
  login.user.id === user.id,
  "Login returns correct user",
);

const jwtPayload =
  jwtService.verify(login.accessToken);

assert(
  jwtPayload.sub === user.id,
  "JWT contains correct user ID",
);

assert(
  jwtPayload.email === user.email,
  "JWT contains correct email",
);

assert(
  Array.isArray(jwtPayload.roles),
  "JWT contains user roles",
);

assert(
  jwtService.isValid(login.accessToken),
  "JWT is valid",
);

const tokenUser =
  authenticationService.authenticateToken(
    login.accessToken,
  );

assert(
  tokenUser.id === user.id,
  "JWT authentication returns correct user",
);

assert(
  sessionService.validateToken(
    login.sessionToken,
  ),
  "Session token is valid",
);

const sessionUser =
  authenticationService.authenticateSession(
    login.sessionToken,
  );

assert(
  sessionUser.id === user.id,
  "Session authentication returns correct user",
);

const refreshed =
  authenticationService.refreshSession(
    login.sessionId,
  );

assert(
  !!refreshed.accessToken,
  "Session refresh generates access token",
);

assert(
  refreshed.user.id === user.id,
  "Session refresh preserves user",
);

const googleState =
  oauthService.createState("google");

assert(
  !!googleState,
  "OAuth state is generated",
);

assert(
  oauthService.verifyState(googleState),
  "OAuth state is valid",
);

const googleUrl =
  oauthService.getAuthorizationUrl(
    "google",
    googleState,
  );

assert(
  googleUrl.includes("accounts.google.com"),
  "Google OAuth URL is generated",
);

const githubState =
  oauthService.createState("github");

const githubUrl =
  oauthService.getAuthorizationUrl(
    "github",
    githubState,
  );

assert(
  githubUrl.includes("github.com"),
  "GitHub OAuth URL is generated",
);

assert(
  authenticationService.logout(login.sessionId),
  "User can logout",
);

assert(
  !sessionService.validate(login.sessionId),
  "Logged out session is invalid",
);

const login2 =
  authenticationService.login({
    email: "john@example.com",
    password,
  });

const login3 =
  authenticationService.login({
    email: "john@example.com",
    password,
  });

assert(
  authenticationService.logoutAll(user.id) >= 2,
  "All user sessions can be revoked",
);

let revokedSessionRejected = false;

try {
  authenticationService.authenticateSession(
    login2.sessionToken,
  );
} catch {
  revokedSessionRejected = true;
}

assert(
  revokedSessionRejected,
  "Revoked session is rejected",
);

let invalidLoginRejected = false;

try {
  authenticationService.login({
    email: "john@example.com",
    password: "WrongPassword123!",
  });
} catch {
  invalidLoginRejected = true;
}

assert(
  invalidLoginRejected,
  "Invalid password login is rejected",
);

let invalidTokenRejected = false;

try {
  authenticationService.authenticateToken(
    "invalid.jwt.token",
  );
} catch {
  invalidTokenRejected = true;
}

assert(
  invalidTokenRejected,
  "Invalid JWT is rejected",
);

const health =
  authenticationService.health();

assert(
  health.healthy,
  "Authentication service is healthy",
);

assert(
  health.users === 1,
  "Authentication health reports users",
);

authenticationService.clear();

assert(
  authenticationService.health().users === 0,
  "Authentication data can be cleared",
);

console.log("All authentication tests passed.");
