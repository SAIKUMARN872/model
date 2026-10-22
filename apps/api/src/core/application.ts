import {
  DependencyContainer,
} from "./container.js";
import type {
  LifecycleComponent,
} from "./lifecycle.js";
import {
  ApplicationLifecycle,
} from "./lifecycle.js";

export type ApplicationState =
  | "created"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "failed";

/**
 * Coordinates application lifecycle and dependency cleanup.
 *
 * This class is deliberately independent of the HTTP server entry point.
 * The caller decides which components to register and when to start or stop.
 */
export class Application {
  readonly container: DependencyContainer;
  readonly lifecycle: ApplicationLifecycle;

  private stateValue: ApplicationState = "created";
  private startPromise: Promise<void> | undefined;
  private stopPromise: Promise<void> | undefined;

  constructor(
    container: DependencyContainer = new DependencyContainer(),
    lifecycle: ApplicationLifecycle = new ApplicationLifecycle(),
  ) {
    this.container = container;
    this.lifecycle = lifecycle;
  }

  get state(): ApplicationState {
    return this.stateValue;
  }

  register(component: LifecycleComponent): this {
    if (this.stateValue !== "created") {
      throw new Error(
        `Cannot register components while application is ${this.stateValue}.`,
      );
    }

    this.lifecycle.register(component);
    return this;
  }

  start(): Promise<void> {
    if (this.stateValue === "running") {
      return Promise.resolve();
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    if (this.stateValue !== "created") {
      return Promise.reject(
        new Error(
          `Cannot start application while state is ${this.stateValue}.`,
        ),
      );
    }

    this.stateValue = "starting";
    this.startPromise = this.startInternal();
    return this.startPromise;
  }

  stop(): Promise<void> {
    if (this.stopPromise) {
      return this.stopPromise;
    }

    if (this.stateValue === "stopped") {
      return Promise.resolve();
    }

    this.stateValue = "stopping";
    this.stopPromise = this.stopInternal();
    return this.stopPromise;
  }

  private async startInternal(): Promise<void> {
    try {
      await this.lifecycle.start();

      // Preserve "stopping" if shutdown was requested during startup.
      if (this.stateValue === "starting") {
        this.stateValue = "running";
      }
    } catch (startError: unknown) {
      this.stateValue = "failed";

      try {
        await this.container.dispose();
      } catch (cleanupError: unknown) {
        throw new AggregateError(
          [startError, cleanupError],
          "Application startup failed and dependency cleanup also failed.",
        );
      }

      throw startError;
    }
  }

  private async stopInternal(): Promise<void> {
    const errors: unknown[] = [];

    // If startup is in progress, wait for its cleanup or completion first.
    if (this.startPromise) {
      try {
        await this.startPromise;
      } catch {
        // Startup has already reported its error to its caller.
        // Continue shutdown to ensure all remaining resources are cleaned up.
      }
    }

    try {
      await this.lifecycle.stop();
    } catch (error: unknown) {
      errors.push(error);
    }

    try {
      await this.container.dispose();
    } catch (error: unknown) {
      errors.push(error);
    }

    this.stateValue = errors.length > 0 ? "failed" : "stopped";

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        "Application shutdown completed with cleanup errors.",
      );
    }
  }
}
