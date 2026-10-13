import type { AuditEvent } from "../events/event_processor.js";

export interface AuditReport {
    id: string;
    generatedAt: Date;
    from?: Date;
    to?: Date;
    totalEvents: number;
    events: AuditEvent[];
    summary: Record<string, number>;
}

export interface ReportGeneratorOptions {
    now?: () => Date;
}

export class ReportGenerator {
    private readonly now: () => Date;

    constructor(options: ReportGeneratorOptions = {}) {
        this.now = options.now ?? (() => new Date());
    }

    generate(
        events: AuditEvent[],
        options: {
            id?: string;
            from?: Date;
            to?: Date;
        } = {}
    ): AuditReport {
        const filtered = events.filter((event) => {
            const timestamp = event.timestamp.getTime();

            if (
                options.from &&
                timestamp < options.from.getTime()
            ) {
                return false;
            }

            if (
                options.to &&
                timestamp > options.to.getTime()
            ) {
                return false;
            }

            return true;
        });

        const summary: Record<string, number> = {};

        for (const event of filtered) {
            summary[event.action] = (summary[event.action] ?? 0) + 1;
        }

        return {
            id: options.id ?? `report-${this.now().getTime()}`,
            generatedAt: this.now(),
            from: options.from
                ? new Date(options.from)
                : undefined,
            to: options.to
                ? new Date(options.to)
                : undefined,
            totalEvents: filtered.length,
            events: filtered.map(cloneEvent),
            summary
        };
    }
}

function cloneEvent(
    event: AuditEvent
): AuditEvent {
    return {
        ...event,
        timestamp: new Date(event.timestamp),
        metadata: { ...event.metadata }
    };
}
