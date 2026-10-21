export class ProviderError extends Error {
  readonly provider: string;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      provider: string;
      statusCode?: number;
      retryable?: boolean;
    },
  ) {
    super(message);
    this.name = "ProviderError";
    this.provider = options.provider;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
  }
}
