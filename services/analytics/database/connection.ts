export interface AnalyticsDatabaseConfig {
  host: string;
  port: number;
  database: string;
}

export class DatabaseConnection {
  constructor(
    private readonly config: AnalyticsDatabaseConfig = {
      host: "localhost",
      port: 5432,
      database: "modelnow",
    },
  ) {}

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {}

  getConfig(): AnalyticsDatabaseConfig {
    return { ...this.config };
  }
}
