import { beforeEach, describe, expect, it } from "vitest";

import { AccessRepository } from "./model_access/access-repository.js";
import { AccessService } from "./model_access/access-service.js";
import { CatalogRepository } from "./model_catalog/catalog-repository.js";
import { CatalogService } from "./model_catalog/catalog-service.js";
import { ConnectionRepository } from "./model_connections/connection-repository.js";
import { ConnectionService } from "./model_connections/connection-service.js";
import { DeploymentRepository } from "./model_deployments/deployment-repository.js";
import { DeploymentService } from "./model_deployments/deployment-service.js";
import { VersionRepository } from "./model_versions/version-repository.js";
import { VersionService } from "./model_versions/version-service.js";

describe("Model modules - combined mock tests", () => {
  let access: AccessService;
  let catalog: CatalogService;
  let connections: ConnectionService;
  let deployments: DeploymentService;
  let versions: VersionService;

  beforeEach(() => {
    access = new AccessService(new AccessRepository());
    catalog = new CatalogService(new CatalogRepository());
    connections = new ConnectionService(new ConnectionRepository());
    deployments = new DeploymentService(new DeploymentRepository());
    versions = new VersionService(new VersionRepository());
  });

  describe("model_access", () => {
    it("grants and retrieves access", async () => {
      const created = await access.grant({
        modelId: "model-1",
        userId: "user-1",
        role: "viewer",
      });

      expect((await access.getById(created.id))?.userId).toBe("user-1");
    });

    it("checks permissions and revokes access", async () => {
      const created = await access.grant({
        modelId: "model-1",
        userId: "admin-1",
        role: "admin",
      });

      expect(await access.canAccess("model-1", "admin-1", "viewer")).toBe(true);
      await access.revoke(created.id);
      expect(await access.getById(created.id)).toBeNull();
    });

    it("rejects duplicate grants", async () => {
      const input = { modelId: "model-1", userId: "user-1", role: "viewer" as const };
      await access.grant(input);
      await expect(access.grant(input)).rejects.toThrow();
    });
  });

  describe("model_catalog", () => {
    it("creates, lists, updates, and deletes a catalog model", async () => {
      const created = await catalog.create({
        name: "Test Model",
        description: "Mock catalog entry",
      });

      expect(await catalog.list()).toHaveLength(1);
      expect((await catalog.getById(created.id))?.name).toBe("Test Model");

      const updated = await catalog.update(created.id, { name: "Updated Model" });
      expect(updated.name).toBe("Updated Model");

      await catalog.delete(created.id);
      expect(await catalog.getById(created.id)).toBeNull();
    });

    it("rejects a blank model name", async () => {
      await expect(catalog.create({ name: " ", description: "Test" })).rejects.toThrow();
    });
  });

  describe("model_connections", () => {
    it("creates, lists, updates, and deletes a connection", async () => {
      const created = await connections.create({
        modelId: "model-1",
        name: "Test connection",
        endpoint: "https://example.com/api",
      });

      expect(await connections.list()).toHaveLength(1);

      const updated = await connections.update(created.id, { name: "Updated connection" });
      expect(updated.name).toBe("Updated connection");

      await connections.delete(created.id);
      expect(await connections.getById(created.id)).toBeNull();
    });

    it("rejects a connection with a blank endpoint", async () => {
      await expect(
        connections.create({ modelId: "model-1", name: "Bad", endpoint: " " }),
      ).rejects.toThrow();
    });
  });

  describe("model_deployments", () => {
    it("creates, updates, lists, and deletes a deployment", async () => {
      const created = await deployments.create({
        modelId: "model-1",
        environment: "test",
        version: "1.0.0",
      });

      expect(created.status).toBe("pending");
      expect(await deployments.list()).toHaveLength(1);

      const updated = await deployments.update(created.id, {
        status: "running",
        environment: "staging",
      });

      expect(updated.status).toBe("running");
      expect(updated.environment).toBe("staging");

      await deployments.delete(created.id);
      expect(await deployments.getById(created.id)).toBeNull();
    });

    it("rejects a deployment with a blank version", async () => {
      await expect(
        deployments.create({ modelId: "model-1", environment: "test", version: " " }),
      ).rejects.toThrow();
    });
  });

  describe("model_versions", () => {
    it("creates, lists, updates, and deletes a version", async () => {
      const created = await versions.create({
        modelId: "model-1",
        version: "1.0.0",
        description: "Initial version",
      });

      expect(await versions.list()).toHaveLength(1);
      expect((await versions.getById(created.id))?.version).toBe("1.0.0");

      const updated = await versions.update(created.id, {
        description: "Updated version",
      });
      expect(updated.description).toBe("Updated version");

      await versions.delete(created.id);
      expect(await versions.getById(created.id)).toBeNull();
    });

    it("rejects a version with a blank version number", async () => {
      await expect(
        versions.create({ modelId: "model-1", version: " ", description: "Test" }),
      ).rejects.toThrow();
    });
  });
});
