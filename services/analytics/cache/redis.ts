export interface RedisConfig {
  host: string;
  port: number;
  database: number;
}

export class RedisClient {
  constructor(
    private readonly config: RedisConfig = {
      host: "localhost",
      port: 6379,
      database: 0,
    },
  ) {}

  getConfig(): RedisConfig {
    return { ...this.config };
  }

  async ping(): Promise<string> {
    return "PONG";
  }
}
