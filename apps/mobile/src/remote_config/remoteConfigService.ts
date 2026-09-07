export interface RemoteConfig {
  key: string;
  value: unknown;
  enabled: boolean;
  updatedAt: string;
}

export class RemoteConfigService {
  private configs: Map<string, RemoteConfig> =
    new Map();

  public set(
    key: string,
    value: unknown
  ): RemoteConfig {
    if (!key.trim()) {
      throw new Error(
        "Config key is required."
      );
    }

    const config: RemoteConfig = {
      key,
      value,
      enabled: true,
      updatedAt:
        new Date().toISOString(),
    };

    this.configs.set(key, config);

    return config;
  }

  public get(
    key: string
  ): unknown {
    const config =
      this.configs.get(key);

    if (!config || !config.enabled) {
      return undefined;
    }

    return config.value;
  }

  public getConfig(
    key: string
  ): RemoteConfig | undefined {
    return this.configs.get(key);
  }

  public getAll(): RemoteConfig[] {
    return Array.from(
      this.configs.values()
    );
  }

  public enable(
    key: string
  ): boolean {
    const config =
      this.configs.get(key);

    if (!config) {
      return false;
    }

    config.enabled = true;
    config.updatedAt =
      new Date().toISOString();

    return true;
  }

  public disable(
    key: string
  ): boolean {
    const config =
      this.configs.get(key);

    if (!config) {
      return false;
    }

    config.enabled = false;
    config.updatedAt =
      new Date().toISOString();

    return true;
  }

  public remove(
    key: string
  ): boolean {
    return this.configs.delete(key);
  }

  public clear(): void {
    this.configs.clear();
  }

  public count(): number {
    return this.configs.size;
  }
}

const remoteConfigService =
  new RemoteConfigService();

export default remoteConfigService;