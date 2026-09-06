export interface BootstrapResult {
  started: boolean;
  startedAt: string;
  message: string;
}

let started = false;

export function bootstrap(): BootstrapResult {
  if (started) {
    return {
      started: true,
      startedAt:
        new Date().toISOString(),
      message:
        "Application is already started.",
    };
  }

  started = true;

  return {
    started: true,
    startedAt:
      new Date().toISOString(),
    message:
      "Application started successfully.",
  };
}

export function isBootstrapped(): boolean {
  return started;
}

export function resetBootstrap(): void {
  started = false;
}

export default bootstrap;