export type LifecycleAction = () => void | Promise<void>;

export interface LifecycleComponent {
  readonly name: string;
  readonly start: LifecycleAction;
  readonly stop: LifecycleAction;
}

export type LifecycleState =
  | "idle"
  | "starting"
  | "started"
  | "stopping"
  | "stopped"
  | "failed";

/**
 * Coordinates application components without owning their resources.
 * Components start in registration order and stop in reverse start order.
 */
export class ApplicationLifecycle {
  private readonly components: LifecycleComponent[] = [];
  private readonly startedComponents: LifecycleComponent[] = [];
  private stateValue: LifecycleState = "idle";
  private startPromise: Promise<void> | undefined;
  private stopPromise: Promise<void> | undefined;

  get state(): LifecycleState {
    return this.stateValue;
  }

  register(component: LifecycleComponent): this {
    if (this.stateValue !== "idle") {
      throw new Error(
        `Cannot register lifecycle components while lifecycle is ${this.stateValue}.`,
      );
    }

    if (
      !component ||
      typeof component.name !== "string" ||
      component.name.trim().length === 0 ||
      typeof component.start !== "function" ||
      typeof component.stop !== "function"
    ) {
      throw new TypeError(
        "Lifecycle component requires a name and start/stop functions.",
      );
    }

    if (this.components.some((item) => item.name === component.name)) {
      throw new Error(
        `Lifecycle component "${component.name}" is already registered.`,
      );
    }

    this.components.push(component);
    return this;
  }

  start(): Promise<void> {
    if (this.stateValue === "started") {
      return Promise.resolve();
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    if (this.stateValue !== "idle") {
      return Promise.reject(
        new Error(`Cannot start lifecycle while state is ${this.stateValue}.`),
      );
    }

    this.stateValue = "starting";
    this.startPromise = this.startComponents();
    return this.startPromise;
  }

  stop(): Promise<void> {
    if (this.stopPromise) {
      return this.stopPromise;
    }

    if (this.stateValue === "stopped") {
      return Promise.resolve();
    }

    if (this.stateValue === "starting" && this.startPromise) {
      this.stopPromise = this.startPromise
        .catch(() => undefined)
        .then(() => this.stopStartedComponents());

      return this.stopPromise;
    }

    if (this.stateValue === "idle") {
      this.stateValue = "stopped";
      return Promise.resolve();
    }

    this.stopPromise = this.stopStartedComponents();
    return this.stopPromise;
  }

  private async startComponents(): Promise<void> {
    try {
      for (const component of this.components) {
        await component.start();
        this.startedComponents.push(component);
      }

      this.stateValue = "started";
    } catch (startError: unknown) {
      this.stateValue = "failed";

      const cleanupErrors = await this.stopComponentsInReverseOrder();

      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [startError, ...cleanupErrors],
          "Application startup failed and one or more started components failed to stop.",
        );
      }

      throw startError;
    }
  }

  private async stopStartedComponents(): Promise<void> {
    this.stateValue = "stopping";
    const errors = await this.stopComponentsInReverseOrder();
    this.stateValue = errors.length > 0 ? "failed" : "stopped";

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        "One or more lifecycle components failed to stop.",
      );
    }
  }

  private async stopComponentsInReverseOrder(): Promise<unknown[]> {
    const errors: unknown[] = [];

    while (this.startedComponents.length > 0) {
      const component = this.startedComponents.pop();

      if (!component) {
        continue;
      }

      try {
        await component.stop();
      } catch (error: unknown) {
        errors.push(error);
      }
    }

    return errors;
  }
}
