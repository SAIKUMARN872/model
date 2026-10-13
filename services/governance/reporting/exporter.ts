import type { GovernanceReport } from "./report.js";

export function exportReport(report: GovernanceReport): string {
    if (report.format === "json") return JSON.stringify(report, null, 2);

    if (report.format === "markdown") {
        return [
            `# ${report.title}`,
            "",
            `Generated: ${report.generatedAt}`,
            ...report.sections.flatMap((section) => [
                "",
                `## ${section.heading}`,
                "",
                typeof section.content === "string"
                    ? section.content
                    : JSON.stringify(section.content, null, 2)
            ])
        ].join("\n");
    }

    const escapeCsv = (value: unknown): string => {
        const text = typeof value === "string" ? value : JSON.stringify(value);
        return `"${text.replaceAll('"', '""')}"`;
    };
    return [
        "report_id,title,generated_at,section,content",
        ...report.sections.map((section) =>
            [
                report.id,
                report.title,
                report.generatedAt,
                section.heading,
                section.content
            ].map(escapeCsv).join(",")
        )
    ].join("\n");
}
