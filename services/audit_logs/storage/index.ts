export {
    AuditArchive,
    type ArchiveEntry
} from "./archive.js";

export {
    InMemoryAuditRepository,
    type AuditRepository
} from "./repository.js";

function cloneEntry(
    entry: import("./archive.js").ArchiveEntry
): import("./archive.js").ArchiveEntry {
    return {
        archivedAt: new Date(entry.archivedAt),
        event: {
            ...entry.event,
            timestamp: new Date(entry.event.timestamp),
            metadata: { ...entry.event.metadata }
        }
    };
}
