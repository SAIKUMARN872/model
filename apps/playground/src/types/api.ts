export interface ApiRequestOptions
  extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

export interface StreamRequestOptions
  extends ApiRequestOptions {
  payload?: Record<string, unknown>;
  model?: string;
}
