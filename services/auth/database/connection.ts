export interface DatabaseConfig {
  name: string;
  version: number;
  connected: boolean;
}

export interface DatabaseHealth {
  healthy: boolean;
  connected: boolean;
  name: string;
  version: number;
}

export class DatabaseConnection {
  private readonly config: DatabaseConfig;

  constructor(
    name = "modelnow-auth",
    version = 1,
  ) {
    this.config = {
      name,
      version,
      connected: false,
    };
  }

  connect(): void {
    this.config.connected = true;
  }

  disconnect(): void {
    this.config.connected = false;
  }

  isConnected(): boolean {
    return this.config.connected;
  }

  getConfig(): DatabaseConfig {
    return {
      ...this.config,
    };
  }

  health(): DatabaseHealth {
    return {
      healthy: this.config.connected,
      connected: this.config.connected,
      name: this.config.name,
      version: this.config.version,
    };
  }
}

export const databaseConnection = new DatabaseConnection();
