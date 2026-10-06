export interface AccountConfig {
  port: number;
  host: string;
  environment: string;
}

export function loadAccountConfig(): AccountConfig {
  return {
    port: Number(process.env.ACCOUNT_PORT ?? 4010),
    host: process.env.ACCOUNT_HOST ?? "0.0.0.0",
    environment: process.env.NODE_ENV ?? "development",
  };
}
