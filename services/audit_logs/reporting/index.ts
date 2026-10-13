export {
    ReportGenerator,
    type AuditReport,
    type ReportGeneratorOptions
} from "./report_generator.js";

export {
    AuditReportExporter,
    type ReportFormat
} from "./exporter.js";

function cloneEvent(event: import("../events/event_processor.js").AuditEvent) {
    return {
        ...event,
        timestamp: new Date(event.timestamp),
        metadata: { ...event.metadata }
    };
}
