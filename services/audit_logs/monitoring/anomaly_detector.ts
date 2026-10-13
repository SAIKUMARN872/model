import type { AuditEvent } from "../events/event_processor.js";

export interface Anomaly {
    id: string;
    eventId: string;
    type: string;
    score: number;
    reason: string;
    detectedAt: Date;
}

export interface AnomalyDetectorOptions {
    threshold?: number;
    now?: () => Date;
}

export class AnomalyDetector {
    private readonly threshold: number;
    private readonly now: () => Date;

    constructor(options: AnomalyDetectorOptions = {}) {
        this.threshold = options.threshold ?? 3;
        this.now = options.now ?? (() => new Date());

        if (
            !Number.isFinite(this.threshold) ||
            this.threshold < 0
        ) {
            throw new Error("Anomaly threshold must be non-negative");
        }
    }

    detect(
        event: AuditEvent,
        score: number,
        reason = "Anomalous audit activity"
    ): Anomaly | undefined {
        if (!Number.isFinite(score)) {
            throw new Error("Anomaly score must be finite");
        }

        if (score < this.threshold) {
            return undefined;
        }

        return {
            id: `${event.id}:anomaly`,
            eventId: event.id,
            type: event.type,
            score,
            reason,
            detectedAt: this.now()
        };
    }

    isAnomalous(score: number): boolean {
        return score >= this.threshold;
    }
}
