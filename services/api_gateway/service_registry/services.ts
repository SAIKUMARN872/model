export interface Service {
  name: string;
  url: string;
  version: string;
  healthy: boolean;
  metadata: Record<string, string>;
}
