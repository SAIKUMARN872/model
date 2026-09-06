export interface CrashReport {
  id: string;
  message: string;
  stack?: string;
  name?: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class CrashReporter {
  private reports: CrashReport[] = [];

  public report(
    error: unknown,
    context?: Record<string, unknown>
  ): CrashReport {
    const normalizedError =
      error instanceof Error
        ? error
        : new Error(String(error));

    const report: CrashReport = {
      id: this.generateId(),
      message: normalizedError.message,
      stack: normalizedError.stack,
      name: normalizedError.name,
      timestamp: new Date().toISOString(),
      context,
    };

    this.reports.push(report);

    console.error(
      "Crash Report:",
      report
    );

    return report;
  }

  public capture(
    error: unknown,
    context?: Record<string, unknown>
  ): void {
    this.report(error, context);
  }

  public getReports(): CrashReport[] {
    return [...this.reports];
  }

  public getReport(
    id: string
  ): CrashReport | undefined {
    return this.reports.find(
      (report) => report.id === id
    );
  }

  public clear(): void {
    this.reports = [];
  }

  public count(): number {
    return this.reports.length;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const crashReporter =
  new CrashReporter();

export default crashReporter;