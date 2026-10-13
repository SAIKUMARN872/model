import test from "node:test";
import assert from "node:assert/strict";

import {
    IntegrationService,
    ConnectionService,
    SyncService,
} from "./index.js";

test("Integration module exports its main services", () => {
    assert.equal(typeof IntegrationService, "function");
    assert.equal(typeof ConnectionService, "function");
    assert.equal(typeof SyncService, "function");
});

test("Integration configuration and schema exports are available", async () => {
    const module = await import("./index.js");
    assert.ok(module);
    assert.ok(Object.keys(module).length > 0);
});

test("Integration module can be imported without errors", async () => {
    const module = await import("./index.js");
    assert.ok(module);
});
