export interface GovernanceReport {
    id: string;
    title: string;
    generatedAt: string;
    format: "json" | "csv" | "markdown";
    sections: Array<{ heading: string; content: unknown }>;
}

export function createReport(input: Omit<GovernanceReport, "generatedAt">): GovernanceReport {
    if (!input.title.trim()) throw new Error("Report title is required");
    return { ...input, generatedAt: new Date().toISOString() };
}
