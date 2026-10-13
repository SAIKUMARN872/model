import type { AuditEvent } from "../events/event_processor.js";
import {
    AnomalyDetector,
    type Anomaly
} from "./anomaly_detector.js";

export interface AuditMonitorOptions {
    detector?: AnomalyDetector;
}

export class AuditMonitor {
    private readonly detector: AnomalyDetector;
    private readonly anomalies: Anomaly[] = [];

    constructor(options: AuditMonitorOptions = {}) {
        this.detector = options.detector ?? new AnomalyDetector();
    }

    inspect(
        event: AuditEvent,
        score: number,
        reason?: string
    ): Anomaly | undefined {
        const anomaly = this.detector.detect(event, score, reason);

        if (anomaly) {
            this.anomalies.push(anomaly);
        }

        return anomaly;
    }

    getAnomalies(): Anomaly[] {
        return this.anomalies.map((anomaly) => ({
            ...anomaly,
            detectedAt: new Date(anomaly.detectedAt)
        }));
    }

    clear(): void {
        this.anomalies.length = 0;
    }

    count(): number {
        return this.anomalies.length;
    }
}
