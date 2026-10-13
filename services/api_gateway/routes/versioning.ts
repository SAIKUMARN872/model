export type ApiVersion = "v1" | "v2";

export function normalizeVersion(
  version?: string,
): ApiVersion {
  if (version === "v1" || version === "v2") {
    return version;
  }

  return "v1";
}

export function versionPath(
  version: ApiVersion,
  path: string,
): string {
  const normalized = path.startsWith("/")
    ? path
    : `/${path}`;

  return `/api/${version}${normalized}`;
}
