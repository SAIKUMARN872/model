import type { AuditEvent } from "../events/event_processor.js";

export interface ArchiveEntry {
    archivedAt: Date;
    event: AuditEvent;
}

export class AuditArchive {
    private readonly entries: ArchiveEntry[] = [];

    archive(event: AuditEvent): ArchiveEntry {
        const entry: ArchiveEntry = {
            archivedAt: new Date(),
            event: {
                ...event,
                timestamp: new Date(event.timestamp),
                metadata: { ...event.metadata }
            }
        };

        this.entries.push(entry);

        return cloneEntry(entry);
    }

    list(): ArchiveEntry[] {
        return this.entries.map(cloneEntry);
    }

    count(): number {
        return this.entries.length;
    }

    clear(): void {
        this.entries.length = 0;
    }
}

function cloneEntry(
    entry: ArchiveEntry
): ArchiveEntry {
    return {
        archivedAt: new Date(entry.archivedAt),
        event: {
            ...entry.event,
            timestamp: new Date(entry.event.timestamp),
            metadata: { ...entry.event.metadata }
        }
    };
}
