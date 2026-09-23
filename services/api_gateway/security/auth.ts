export type SecurityAuthType =
  | "api_key"
  | "bearer"
  | "basic"
  | "none";

export interface AuthRequest {
  headers?: Record<string, string | undefined>;
  apiKey?: string;
  bearerToken?: string;
  username?: string;
  password?: string;
}

export interface AuthResult {
  authenticated: boolean;
  type: SecurityAuthType;
  subject?: string;
  reason?: string;
}

export interface ApiKeyRecord {
  key: string;
  subject: string;
  scopes?: string[];
  enabled?: boolean;
  metadata?: Record<string, string>;
}

export interface AuthOptions {
  apiKeys?: ApiKeyRecord[];
  bearerTokens?: Record<string, string>;
  basicUsers?: Record<string, string>;
}

function getHeader(
  headers: Record<string, string | undefined> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }

  const target = name.toLowerCase();

  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === target,
  );

  return entry?.[1];
}

export class SecurityAuthenticator {
  private readonly apiKeys = new Map<string, ApiKeyRecord>();

  private readonly bearerTokens = new Map<string, string>();

  private readonly basicUsers = new Map<string, string>();

  constructor(options: AuthOptions = {}) {
    for (const record of options.apiKeys ?? []) {
      this.addApiKey(record);
    }

    for (const [token, subject] of Object.entries(
      options.bearerTokens ?? {},
    )) {
      this.addBearerToken(token, subject);
    }

    for (const [username, password] of Object.entries(
      options.basicUsers ?? {},
    )) {
      this.addBasicUser(username, password);
    }
  }

  addApiKey(record: ApiKeyRecord): void {
    if (!record.key.trim()) {
      throw new Error("API key is required");
    }

    if (!record.subject.trim()) {
      throw new Error("API key subject is required");
    }

    if (this.apiKeys.has(record.key)) {
      throw new Error("API key already exists");
    }

    this.apiKeys.set(record.key, {
      ...record,
      enabled: record.enabled ?? true,
      scopes: record.scopes ? [...record.scopes] : [],
      metadata: record.metadata
        ? { ...record.metadata }
        : undefined,
    });
  }

  removeApiKey(key: string): boolean {
    return this.apiKeys.delete(key);
  }

  addBearerToken(token: string, subject: string): void {
    if (!token.trim()) {
      throw new Error("Bearer token is required");
    }

    if (!subject.trim()) {
      throw new Error("Bearer token subject is required");
    }

    this.bearerTokens.set(token, subject);
  }

  removeBearerToken(token: string): boolean {
    return this.bearerTokens.delete(token);
  }

  addBasicUser(username: string, password: string): void {
    if (!username.trim()) {
      throw new Error("Username is required");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    this.basicUsers.set(username, password);
  }

  removeBasicUser(username: string): boolean {
    return this.basicUsers.delete(username);
  }

  authenticate(request: AuthRequest): AuthResult {
    if (request.apiKey) {
      return this.authenticateApiKey(request.apiKey);
    }

    const headerApiKey = getHeader(request.headers, "x-api-key");

    if (headerApiKey) {
      return this.authenticateApiKey(headerApiKey);
    }

    if (request.bearerToken) {
      return this.authenticateBearer(request.bearerToken);
    }

    const authorization = getHeader(
      request.headers,
      "authorization",
    );

    if (authorization) {
      const bearerPrefix = "Bearer ";

      if (authorization.startsWith(bearerPrefix)) {
        return this.authenticateBearer(
          authorization.slice(bearerPrefix.length).trim(),
        );
      }

      const basicPrefix = "Basic ";

      if (authorization.startsWith(basicPrefix)) {
        return this.authenticateBasicHeader(
          authorization.slice(basicPrefix.length).trim(),
        );
      }
    }

    if (request.username !== undefined) {
      return this.authenticateBasic(
        request.username,
        request.password ?? "",
      );
    }

    return {
      authenticated: false,
      type: "none",
      reason: "Authentication credentials were not provided",
    };
  }

  authenticateApiKey(key: string): AuthResult {
    const record = this.apiKeys.get(key);

    if (!record) {
      return {
        authenticated: false,
        type: "api_key",
        reason: "Invalid API key",
      };
    }

    if (record.enabled === false) {
      return {
        authenticated: false,
        type: "api_key",
        reason: "API key is disabled",
      };
    }

    return {
      authenticated: true,
      type: "api_key",
      subject: record.subject,
    };
  }

  authenticateBearer(token: string): AuthResult {
    if (!token.trim()) {
      return {
        authenticated: false,
        type: "bearer",
        reason: "Bearer token is empty",
      };
    }

    const subject = this.bearerTokens.get(token);

    if (!subject) {
      return {
        authenticated: false,
        type: "bearer",
        reason: "Invalid bearer token",
      };
    }

    return {
      authenticated: true,
      type: "bearer",
      subject,
    };
  }

  authenticateBasic(
    username: string,
    password: string,
  ): AuthResult {
    const expectedPassword = this.basicUsers.get(username);

    if (
      expectedPassword === undefined ||
      expectedPassword !== password
    ) {
      return {
        authenticated: false,
        type: "basic",
        reason: "Invalid username or password",
      };
    }

    return {
      authenticated: true,
      type: "basic",
      subject: username,
    };
  }

  hasApiKey(key: string): boolean {
    return this.apiKeys.has(key);
  }

  hasBearerToken(token: string): boolean {
    return this.bearerTokens.has(token);
  }

  hasBasicUser(username: string): boolean {
    return this.basicUsers.has(username);
  }

  getApiKeyCount(): number {
    return this.apiKeys.size;
  }

  getBearerTokenCount(): number {
    return this.bearerTokens.size;
  }

  getBasicUserCount(): number {
    return this.basicUsers.size;
  }

  clear(): void {
    this.apiKeys.clear();
    this.bearerTokens.clear();
    this.basicUsers.clear();
  }

  health(): {
    healthy: boolean;
    apiKeys: number;
    bearerTokens: number;
    basicUsers: number;
  } {
    return {
      healthy: true,
      apiKeys: this.apiKeys.size,
      bearerTokens: this.bearerTokens.size,
      basicUsers: this.basicUsers.size,
    };
  }

  private authenticateBasicHeader(
    encodedCredentials: string,
  ): AuthResult {
    try {
      const decoded = Buffer.from(
        encodedCredentials,
        "base64",
      ).toString("utf8");

      const separatorIndex = decoded.indexOf(":");

      if (separatorIndex === -1) {
        return {
          authenticated: false,
          type: "basic",
          reason: "Invalid Basic authentication format",
        };
      }

      const username = decoded.slice(0, separatorIndex);
      const password = decoded.slice(separatorIndex + 1);

      return this.authenticateBasic(username, password);
    } catch {
      return {
        authenticated: false,
        type: "basic",
        reason: "Invalid Basic authentication encoding",
      };
    }
  }
}

export const authenticator = new SecurityAuthenticator();