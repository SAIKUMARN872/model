export interface ApiVersion {
  version: string;
  prefix: string;
  deprecated: boolean;
  sunsetAt?: string;
}

export interface VersionMatch {
  version: string;
  path: string;
}

export class ApiVersionManager {
  private readonly versions = new Map<
    string,
    ApiVersion
  >();

  private readonly defaultVersion: string;

  constructor(defaultVersion = "v1") {
    this.defaultVersion = defaultVersion;
  }

  addVersion(
    version: string,
    options: {
      deprecated?: boolean;
      sunsetAt?: string;
    } = {},
  ): ApiVersion {
    const normalized = this.normalizeVersion(version);

    if (this.versions.has(normalized)) {
      throw new Error(
        `API version already exists: ${normalized}`,
      );
    }

    const apiVersion: ApiVersion = {
      version: normalized,
      prefix: `/api/${normalized}`,
      deprecated: options.deprecated ?? false,
      sunsetAt: options.sunsetAt,
    };

    this.versions.set(normalized, apiVersion);

    return { ...apiVersion };
  }

  updateVersion(
    version: string,
    changes: Partial<
      Pick<ApiVersion, "deprecated" | "sunsetAt">
    >,
  ): ApiVersion {
    const normalized = this.normalizeVersion(version);

    const existing =
      this.versions.get(normalized);

    if (!existing) {
      throw new Error(
        `API version not found: ${normalized}`,
      );
    }

    const updated: ApiVersion = {
      ...existing,
      ...changes,
    };

    this.versions.set(normalized, updated);

    return { ...updated };
  }

  getVersion(
    version: string,
  ): ApiVersion | undefined {
    const normalized =
      this.normalizeVersion(version);

    const result =
      this.versions.get(normalized);

    return result ? { ...result } : undefined;
  }

  getVersions(): ApiVersion[] {
    return [...this.versions.values()].map(
      (version) => ({ ...version }),
    );
  }

  getDefaultVersion(): string {
    return this.defaultVersion;
  }

  resolve(path: string): VersionMatch {
    const normalizedPath =
      path.startsWith("/") ? path : `/${path}`;

    const parts =
      normalizedPath.split("/").filter(Boolean);

    if (
      parts.length >= 2 &&
      parts[0] === "api"
    ) {
      const version = parts[1];

      if (this.versions.has(version)) {
        const remaining =
          parts.slice(2);

        const remainingPath =
          remaining.length > 0
            ? `/${remaining.join("/")}`
            : "/";

        return {
          version,
          path: remainingPath,
        };
      }
    }

    return {
      version: this.defaultVersion,
      path: normalizedPath,
    };
  }

  isSupported(version: string): boolean {
    return this.versions.has(
      this.normalizeVersion(version),
    );
  }

  isDeprecated(version: string): boolean {
    const apiVersion =
      this.getVersion(version);

    return apiVersion?.deprecated ?? false;
  }

  removeVersion(version: string): boolean {
    const normalized =
      this.normalizeVersion(version);

    if (normalized === this.defaultVersion) {
      throw new Error(
        "Default API version cannot be removed",
      );
    }

    return this.versions.delete(normalized);
  }

  size(): number {
    return this.versions.size;
  }

  clear(): void {
    this.versions.clear();
  }

  health(): {
    healthy: boolean;
    defaultVersion: string;
    versionCount: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      defaultVersion: this.defaultVersion,
      versionCount: this.versions.size,
      timestamp: new Date().toISOString(),
    };
  }

  private normalizeVersion(
    version: string,
  ): string {
    const normalized =
      version.trim().toLowerCase();

    if (!/^v\d+$/.test(normalized)) {
      throw new Error(
        `Invalid API version: ${version}`,
      );
    }

    return normalized;
  }
}