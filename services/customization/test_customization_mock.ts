import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
    loadCustomizationConfig,
    customizationSettings,
    CustomizationRepository,
    InstructionRepository,
    PreferenceRepository,
    CustomizationService,
    InstructionService,
    PreferenceService,
    CustomizationController,
    InstructionController,
    PreferenceController,
    CustomizationEventEmitter,
    validateCreateCustomization,
    validateCustomization,
    validateCreateInstruction,
    validateCreatePreference
} from "./index.js";

import type {
    CreateCustomizationInput,
    Customization
} from "./schemas/customization-schema.js";

import type {
    CreateInstructionInput
} from "./schemas/instruction-schema.js";

import type {
    CreatePreferenceInput
} from "./schemas/preference-schema.js";

function makeCustomizationInput(
    overrides: Partial<CreateCustomizationInput> = {}
): CreateCustomizationInput {
    return {
        ownerId: "owner-1",
        name: "My customization",
        enabled: true,
        ...overrides
    };
}

function makeInstructionInput(
    overrides: Partial<CreateInstructionInput> = {}
): CreateInstructionInput {
    return {
        ownerId: "owner-1",
        content: "Use concise answers",
        enabled: true,
        ...overrides
    };
}

function makePreferenceInput(
    overrides: Partial<CreatePreferenceInput> = {}
): CreatePreferenceInput {
    return {
        ownerId: "owner-1",
        key: "theme",
        value: "dark",
        ...overrides
    };
}

function makeCustomizationRecord(): Customization {
    const now = new Date();

    return {
        id: "custom-1",
        ownerId: "owner-1",
        name: "Test customization",
        enabled: true,
        createdAt: now,
        updatedAt: now
    };
}

describe("Customization configuration", () => {
    test("loads default settings", () => {
        const config = loadCustomizationConfig();

        assert.equal(config.maxInstructions, 100);
        assert.equal(config.maxPreferences, 100);
        assert.equal(config.allowCustomInstructions, true);
    });

    test("accepts valid overrides", () => {
        const config = loadCustomizationConfig({
            maxInstructions: 5,
            maxPreferences: 8,
            allowCustomInstructions: false
        });

        assert.equal(config.maxInstructions, 5);
        assert.equal(config.maxPreferences, 8);
        assert.equal(config.allowCustomInstructions, false);
    });

    test("rejects invalid instruction limits", () => {
        assert.throws(
            () => loadCustomizationConfig({ maxInstructions: 0 }),
            /maxInstructions/
        );

        assert.throws(
            () => loadCustomizationConfig({ maxInstructions: 1.5 }),
            /maxInstructions/
        );
    });

    test("rejects invalid preference limits", () => {
        assert.throws(
            () => loadCustomizationConfig({ maxPreferences: 0 }),
            /maxPreferences/
        );
    });

    test("exports default settings", () => {
        assert.equal(customizationSettings.maxInstructions, 100);
        assert.equal(customizationSettings.maxPreferences, 100);
    });
});

describe("Customization schemas", () => {
    test("accepts a valid customization input", () => {
        assert.doesNotThrow(() =>
            validateCreateCustomization(makeCustomizationInput())
        );
    });

    test("rejects a missing owner", () => {
        assert.throws(
            () => validateCreateCustomization(
                makeCustomizationInput({ ownerId: " " })
            ),
            /ownerId/
        );
    });

    test("rejects a blank customization name", () => {
        assert.throws(
            () => validateCreateCustomization(
                makeCustomizationInput({ name: " " })
            ),
            /name/
        );
    });

    test("rejects a non-boolean enabled value", () => {
        assert.throws(
            () => validateCreateCustomization({
                ownerId: "owner-1",
                name: "Test",
                enabled: "yes" as unknown as boolean
            }),
            /enabled/
        );
    });

    test("validates a complete customization record", () => {
        assert.doesNotThrow(() =>
            validateCustomization(makeCustomizationRecord())
        );
    });

    test("rejects invalid customization dates", () => {
        const record = makeCustomizationRecord();
        record.createdAt = new Date(Number.NaN);

        assert.throws(
            () => validateCustomization(record),
            /createdAt/
        );
    });
});

describe("Instruction schemas", () => {
    test("accepts valid instruction input", () => {
        assert.doesNotThrow(() =>
            validateCreateInstruction(makeInstructionInput())
        );
    });

    test("rejects missing owner", () => {
        assert.throws(
            () => validateCreateInstruction(
                makeInstructionInput({ ownerId: "" })
            ),
            /ownerId/
        );
    });

    test("rejects blank instruction content", () => {
        assert.throws(
            () => validateCreateInstruction(
                makeInstructionInput({ content: " " })
            ),
            /content/
        );
    });

    test("rejects invalid enabled values", () => {
        assert.throws(
            () => validateCreateInstruction({
                ownerId: "owner-1",
                content: "Test",
                enabled: "true" as unknown as boolean
            }),
            /enabled/
        );
    });
});

describe("Preference schemas", () => {
    test("accepts string preference values", () => {
        assert.doesNotThrow(() =>
            validateCreatePreference(makePreferenceInput())
        );
    });

    test("accepts number, boolean and null preference values", () => {
        for (const value of [42, true, null]) {
            assert.doesNotThrow(() =>
                validateCreatePreference(
                    makePreferenceInput({ value })
                )
            );
        }
    });

    test("rejects missing owner", () => {
        assert.throws(
            () => validateCreatePreference(
                makePreferenceInput({ ownerId: "" })
            ),
            /ownerId/
        );
    });

    test("rejects blank preference keys", () => {
        assert.throws(
            () => validateCreatePreference(
                makePreferenceInput({ key: " " })
            ),
            /key/
        );
    });

    test("rejects non-finite numbers", () => {
        assert.throws(
            () => validateCreatePreference(
                makePreferenceInput({ value: Number.NaN })
            ),
            /finite/
        );
    });

    test("rejects unsupported value types", () => {
        assert.throws(
            () => validateCreatePreference({
                ownerId: "owner-1",
                key: "settings",
                value: { nested: true } as unknown as null
            }),
            /string, number, boolean or null/
        );
    });
});

describe("Customization repository", () => {
    let repository: CustomizationRepository;

    beforeEach(() => {
        repository = new CustomizationRepository();
    });

    test("saves and retrieves a customization", () => {
        const saved = repository.save(makeCustomizationRecord());

        assert.equal(saved.id, "custom-1");
        assert.equal(repository.getById("custom-1")?.name, "Test customization");
    });

    test("returns undefined for an unknown ID", () => {
        assert.equal(repository.getById("missing"), undefined);
    });

    test("lists records by owner", () => {
        repository.save(makeCustomizationRecord());
        repository.save({
            ...makeCustomizationRecord(),
            id: "custom-2",
            ownerId: "owner-2"
        });

        assert.equal(repository.listByOwner("owner-1").length, 1);
        assert.equal(repository.listByOwner("owner-2").length, 1);
    });

    test("returns independent record copies", () => {
        repository.save(makeCustomizationRecord());

        const retrieved = repository.getById("custom-1");
        assert.ok(retrieved);

        retrieved.name = "Changed externally";
        retrieved.createdAt.setFullYear(2000);

        const stored = repository.getById("custom-1");
        assert.equal(stored?.name, "Test customization");
        assert.notEqual(stored?.createdAt.getFullYear(), 2000);
    });

    test("deletes a record", () => {
        repository.save(makeCustomizationRecord());

        assert.equal(repository.delete("custom-1"), true);
        assert.equal(repository.getById("custom-1"), undefined);
        assert.equal(repository.delete("custom-1"), false);
    });
});

describe("Instruction repository", () => {
    test("saves, retrieves and lists instructions", () => {
        const repository = new InstructionRepository();
        const now = new Date();

        repository.save({
            id: "instruction-1",
            ownerId: "owner-1",
            content: "Be concise",
            enabled: true,
            createdAt: now,
            updatedAt: now
        });

        assert.equal(repository.getById("instruction-1")?.content, "Be concise");
        assert.equal(repository.listByOwner("owner-1").length, 1);
        assert.equal(repository.listByOwner("owner-2").length, 0);
    });

    test("deletes an instruction", () => {
        const repository = new InstructionRepository();
        const now = new Date();

        repository.save({
            id: "instruction-1",
            ownerId: "owner-1",
            content: "Be concise",
            enabled: true,
            createdAt: now,
            updatedAt: now
        });

        assert.equal(repository.delete("instruction-1"), true);
        assert.equal(repository.getById("instruction-1"), undefined);
    });
});

describe("Preference repository", () => {
    test("saves and retrieves preferences by ID", () => {
        const repository = new PreferenceRepository();
        const now = new Date();

        repository.save({
            id: "preference-1",
            ownerId: "owner-1",
            key: "theme",
            value: "dark",
            createdAt: now,
            updatedAt: now
        });

        assert.equal(repository.getById("preference-1")?.value, "dark");
    });

    test("finds preferences by owner and key", () => {
        const repository = new PreferenceRepository();
        const now = new Date();

        repository.save({
            id: "preference-1",
            ownerId: "owner-1",
            key: "theme",
            value: "dark",
            createdAt: now,
            updatedAt: now
        });

        assert.equal(
            repository.getByOwnerAndKey("owner-1", "theme")?.value,
            "dark"
        );

        assert.equal(
            repository.getByOwnerAndKey("owner-2", "theme"),
            undefined
        );
    });

    test("lists preferences by owner and deletes them", () => {
        const repository = new PreferenceRepository();
        const now = new Date();

        repository.save({
            id: "preference-1",
            ownerId: "owner-1",
            key: "theme",
            value: "dark",
            createdAt: now,
            updatedAt: now
        });

        assert.equal(repository.listByOwner("owner-1").length, 1);
        assert.equal(repository.delete("preference-1"), true);
        assert.equal(repository.listByOwner("owner-1").length, 0);
    });
});

describe("Customization service", () => {
    test("creates, retrieves and lists customizations", () => {
        const service = new CustomizationService();
        const created = service.create(makeCustomizationInput());

        assert.ok(created.id);
        assert.equal(created.ownerId, "owner-1");
        assert.equal(created.name, "My customization");
        assert.equal(created.enabled, true);
        assert.equal(service.get(created.id, "owner-1").id, created.id);
        assert.equal(service.list("owner-1").length, 1);
    });

    test("trims owner and name", () => {
        const service = new CustomizationService();
        const created = service.create(
            makeCustomizationInput({
                ownerId: " owner-1 ",
                name: " Custom name "
            })
        );

        assert.equal(created.ownerId, "owner-1");
        assert.equal(created.name, "Custom name");
    });

    test("rejects access by a different owner", () => {
        const service = new CustomizationService();
        const created = service.create(makeCustomizationInput());

        assert.throws(
            () => service.get(created.id, "owner-2"),
            /not found/
        );
    });

    test("updates customization fields", () => {
        const service = new CustomizationService();
        const created = service.create(makeCustomizationInput());

        const updated = service.update(created.id, "owner-1", {
            name: "Updated name",
            enabled: false
        });

        assert.equal(updated.name, "Updated name");
        assert.equal(updated.enabled, false);
        assert.ok(updated.updatedAt.getTime() >= created.updatedAt.getTime());
    });

    test("rejects blank update names", () => {
        const service = new CustomizationService();
        const created = service.create(makeCustomizationInput());

        assert.throws(
            () => service.update(created.id, "owner-1", { name: " " }),
            /name/
        );
    });

    test("deletes customizations", () => {
        const service = new CustomizationService();
        const created = service.create(makeCustomizationInput());

        service.delete(created.id, "owner-1");

        assert.equal(service.list("owner-1").length, 0);
        assert.throws(
            () => service.get(created.id, "owner-1"),
            /not found/
        );
    });

    test("rejects deleting another owner's customization", () => {
        const service = new CustomizationService();
        const created = service.create(makeCustomizationInput());

        assert.throws(
            () => service.delete(created.id, "owner-2"),
            /not found/
        );
    });
});

describe("Instruction service", () => {
    test("creates, retrieves and lists instructions", () => {
        const service = new InstructionService();
        const created = service.create(makeInstructionInput());

        assert.ok(created.id);
        assert.equal(created.content, "Use concise answers");
        assert.equal(service.get(created.id, "owner-1").id, created.id);
        assert.equal(service.list("owner-1").length, 1);
    });

    test("updates instruction content and enabled state", () => {
        const service = new InstructionService();
        const created = service.create(makeInstructionInput());

        const updated = service.update(created.id, "owner-1", {
            content: "Be detailed",
            enabled: false
        });

        assert.equal(updated.content, "Be detailed");
        assert.equal(updated.enabled, false);
    });

    test("rejects blank updated content", () => {
        const service = new InstructionService();
        const created = service.create(makeInstructionInput());

        assert.throws(
            () => service.update(created.id, "owner-1", { content: " " }),
            /content/
        );
    });

    test("rejects access by another owner", () => {
        const service = new InstructionService();
        const created = service.create(makeInstructionInput());

        assert.throws(
            () => service.get(created.id, "owner-2"),
            /not found/
        );
    });

    test("deletes an instruction", () => {
        const service = new InstructionService();
        const created = service.create(makeInstructionInput());

        service.delete(created.id, "owner-1");

        assert.equal(service.list("owner-1").length, 0);
        assert.throws(
            () => service.get(created.id, "owner-1"),
            /not found/
        );
    });
});

describe("Preference service", () => {
    test("creates, retrieves and lists preferences", () => {
        const service = new PreferenceService();
        const created = service.create(makePreferenceInput());

        assert.ok(created.id);
        assert.equal(created.value, "dark");
        assert.equal(service.get(created.id, "owner-1").id, created.id);
        assert.equal(service.getByKey("owner-1", "theme").value, "dark");
        assert.equal(service.list("owner-1").length, 1);
    });

    test("rejects duplicate keys for the same owner", () => {
        const service = new PreferenceService();
        service.create(makePreferenceInput());

        assert.throws(
            () => service.create(makePreferenceInput()),
            /already exists/
        );
    });

    test("allows the same key for different owners", () => {
        const service = new PreferenceService();

        service.create(makePreferenceInput({ ownerId: "owner-1" }));
        service.create(makePreferenceInput({ ownerId: "owner-2" }));

        assert.equal(service.list("owner-1").length, 1);
        assert.equal(service.list("owner-2").length, 1);
    });

    test("updates a preference value", () => {
        const service = new PreferenceService();
        const created = service.create(makePreferenceInput());

        const updated = service.update(created.id, "owner-1", "light");

        assert.equal(updated.value, "light");
        assert.ok(updated.updatedAt.getTime() >= created.updatedAt.getTime());
    });

    test("rejects access by another owner", () => {
        const service = new PreferenceService();
        const created = service.create(makePreferenceInput());

        assert.throws(
            () => service.get(created.id, "owner-2"),
            /not found/
        );
    });

    test("deletes a preference", () => {
        const service = new PreferenceService();
        const created = service.create(makePreferenceInput());

        service.delete(created.id, "owner-1");

        assert.equal(service.list("owner-1").length, 0);
        assert.throws(
            () => service.get(created.id, "owner-1"),
            /not found/
        );
    });
});

describe("Customization events", () => {
    test("emits events and supports unsubscribe", () => {
        const emitter = new CustomizationEventEmitter();
        const received: string[] = [];

        const unsubscribe = emitter.on(event => {
            received.push(event.type);
        });

        emitter.emit(
            "customization.created",
            "owner-1",
            "custom-1",
            { name: "Test" }
        );

        unsubscribe();

        emitter.emit(
            "customization.deleted",
            "owner-1",
            "custom-1",
            { id: "custom-1" }
        );

        assert.deepEqual(received, ["customization.created"]);
    });

    test("clear removes all listeners", () => {
        const emitter = new CustomizationEventEmitter();
        let calls = 0;

        emitter.on(() => {
            calls += 1;
        });

        emitter.clear();
        emitter.emit("instruction.created", "owner-1", "instruction-1", {});

        assert.equal(calls, 0);
    });
});

describe("Controllers", () => {
    test("customization controller delegates CRUD operations", () => {
        const controller = new CustomizationController();
        const created = controller.create(makeCustomizationInput());

        assert.equal(controller.get(created.id, "owner-1").id, created.id);
        assert.equal(controller.list("owner-1").length, 1);

        const updated = controller.update(created.id, "owner-1", {
            name: "Controller updated"
        });

        assert.equal(updated.name, "Controller updated");

        controller.delete(created.id, "owner-1");
        assert.equal(controller.list("owner-1").length, 0);
    });

    test("instruction controller delegates CRUD operations", () => {
        const controller = new InstructionController();
        const created = controller.create(makeInstructionInput());

        assert.equal(controller.get(created.id, "owner-1").id, created.id);
        assert.equal(controller.list("owner-1").length, 1);

        const updated = controller.update(created.id, "owner-1", {
            content: "Updated through controller"
        });

        assert.equal(updated.content, "Updated through controller");

        controller.delete(created.id, "owner-1");
        assert.equal(controller.list("owner-1").length, 0);
    });

    test("preference controller delegates CRUD operations", () => {
        const controller = new PreferenceController();
        const created = controller.create(makePreferenceInput());

        assert.equal(controller.get(created.id, "owner-1").id, created.id);
        assert.equal(controller.getByKey("owner-1", "theme").value, "dark");
        assert.equal(controller.list("owner-1").length, 1);

        const updated = controller.update(created.id, "owner-1", "light");
        assert.equal(updated.value, "light");

        controller.delete(created.id, "owner-1");
        assert.equal(controller.list("owner-1").length, 0);
    });
});
