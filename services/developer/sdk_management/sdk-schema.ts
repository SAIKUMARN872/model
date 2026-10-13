export type SdkStatus = "available" | "deprecated";

export interface SdkRelease {
  id: string;
  name: string;
  language: string;
  version: string;
  packageName: string;
  status: SdkStatus;
  releasedAt: Date;
}

export interface CreateSdkReleaseInput {
  name: string;
  language: string;
  version: string;
  packageName: string;
  status?: SdkStatus;
}

export function validateCreateSdkReleaseInput(input: CreateSdkReleaseInput): void {
  for (const [name, value] of [
    ["name", input.name],
    ["language", input.language],
    ["version", input.version],
    ["packageName", input.packageName],
  ] as const) {
    if (!value.trim()) throw new Error(`${name} is required.`);
  }

  if (input.status !== undefined && !["available", "deprecated"].includes(input.status)) {
    throw new Error("Invalid SDK status.");
  }
}
