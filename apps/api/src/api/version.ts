import { settings } from "../config/settings.js";

export const API_VERSION = settings.apiVersion;

export const API_VERSION_PREFIX = `/api/${API_VERSION}`;

export interface ApiVersionInfo {
  readonly version: string;
  readonly prefix: string;
}

export function getApiVersionInfo(): ApiVersionInfo {
  return Object.freeze({
    version: API_VERSION,
    prefix: API_VERSION_PREFIX,
  });
}