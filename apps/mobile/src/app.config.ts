export interface AppConfig {
  appName: string;
  appVersion: string;
  environment: "development" | "production" | "test";
  apiUrl: string;
  defaultLanguage: string;
  defaultTheme: "light" | "dark";
  enableAnalytics: boolean;
  enableNotifications: boolean;
}

export const appConfig: AppConfig = {
  appName: "AI Platform",
  appVersion: "1.0.0",
  environment: "development",
  apiUrl: "http://localhost:3000",
  defaultLanguage: "en",
  defaultTheme: "light",
  enableAnalytics: true,
  enableNotifications: true,
};

export function getAppConfig(): AppConfig {
  return {
    ...appConfig,
  };
}

export function isProduction(): boolean {
  return (
    appConfig.environment ===
    "production"
  );
}

export function isDevelopment(): boolean {
  return (
    appConfig.environment ===
    "development"
  );
}

export default appConfig;