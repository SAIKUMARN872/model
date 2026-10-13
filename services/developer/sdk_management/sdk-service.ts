import { randomUUID } from "node:crypto";
import type { CreateSdkReleaseInput, SdkRelease } from "./sdk-schema.js";
import { validateCreateSdkReleaseInput } from "./sdk-schema.js";
import { SdkRepository } from "./sdk-repository.js";

export class SdkService {
  constructor(private readonly repository = new SdkRepository()) {}

  register(input: CreateSdkReleaseInput): SdkRelease {
    validateCreateSdkReleaseInput(input);

    if (this.repository.findByPackageAndVersion(input.packageName, input.version)) {
      throw new Error("SDK package version already exists.");
    }

    return this.repository.save({
      id: randomUUID(),
      name: input.name.trim(),
      language: input.language.trim(),
      version: input.version.trim(),
      packageName: input.packageName.trim(),
      status: input.status ?? "available",
      releasedAt: new Date(),
    });
  }

  get(id: string): SdkRelease | undefined {
    return this.repository.getById(id);
  }

  list(): SdkRelease[] {
    return this.repository.list();
  }

  deprecate(id: string): SdkRelease {
    const release = this.repository.getById(id);
    if (!release) throw new Error("SDK release not found.");
    return this.repository.save({ ...release, status: "deprecated" });
  }

  delete(id: string): boolean {
    return this.repository.delete(id);
  }
}
