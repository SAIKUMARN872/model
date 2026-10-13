export interface MultimodalConfig {
  maxContentLength: number;
  enableMockProcessing: boolean;
}

export const config: MultimodalConfig = {
  maxContentLength: 10_000_000,
  enableMockProcessing: true,
};
