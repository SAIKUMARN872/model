import { libraryConfig } from "./config.js";

export type LibrarySettings = {
  maxFileSize: number;
  defaultSearchLimit: number;
  maxSearchLimit: number;
};

export function getLibrarySettings(): LibrarySettings {
  return {
    maxFileSize: libraryConfig.maxFileSize,
    defaultSearchLimit: libraryConfig.defaultSearchLimit,
    maxSearchLimit: libraryConfig.maxSearchLimit,
  };
}
