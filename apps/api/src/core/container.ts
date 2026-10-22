export type ServiceToken<T> = symbol & {
  readonly __serviceType?: (value: T) => T;
};

export type ServiceFactory<T> = (
  container: DependencyContainer,
) => T;

export type ServiceDisposer<T> = (
  instance: T,
) => void | Promise<void>;

interface Registration<T> {
  readonly factory?: ServiceFactory<T>;
  readonly disposer?: ServiceDisposer<T>;
  instance: T | undefined;
  hasInstance: boolean;
  resolving: boolean;
}

/**
 * Creates a typed token for a dependency.
 * Tokens use identity rather than string names to avoid accidental collisions.
 */
export function createServiceToken<T>(description: string): ServiceToken<T> {
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new TypeError("Service token description must not be empty.");
  }

  return Symbol(description) as ServiceToken<T>;
}

/**
 * A synchronous, singleton dependency container.
 *
 * Factories are evaluated on first resolution. Created instances are disposed
 * in reverse creation order when an explicit disposer was registered.
 */
export class DependencyContainer {
  private readonly registrations = new Map<
    symbol,
    Registration<unknown>
  >();

  private readonly creationOrder: symbol[] = [];
  private disposed = false;

  registerInstance<T>(
    token: ServiceToken<T>,
    instance: T,
    disposer?: ServiceDisposer<T>,
  ): this {
    this.assertActive();

    const registration: Registration<T> = {
      instance,
      hasInstance: true,
      resolving: false,
      ...(disposer ? { disposer } : {}),
    };

    this.addRegistration(token, registration);
    this.creationOrder.push(token);
    return this;
  }

  registerFactory<T>(
    token: ServiceToken<T>,
    factory: ServiceFactory<T>,
    disposer?: ServiceDisposer<T>,
  ): this {
    this.assertActive();

    if (typeof factory !== "function") {
      throw new TypeError("Service factory must be a function.");
    }

    const registration: Registration<T> = {
      factory,
      instance: undefined,
      hasInstance: false,
      resolving: false,
      ...(disposer ? { disposer } : {}),
    };

    this.addRegistration(token, registration);
    return this;
  }

  has<T>(token: ServiceToken<T>): boolean {
    return this.registrations.has(token);
  }

  resolve<T>(token: ServiceToken<T>): T {
    this.assertActive();

    const registration = this.registrations.get(
      token,
    ) as Registration<T> | undefined;

    if (!registration) {
      throw new Error(
        `No service is registered for token "${token.description ?? "unnamed"}".`,
      );
    }

    if (registration.hasInstance) {
      return registration.instance as T;
    }

    if (registration.resolving) {
      throw new Error(
        `Circular dependency detected while resolving "${token.description ?? "unnamed"}".`,
      );
    }

    if (!registration.factory) {
      throw new Error(
        `Service "${token.description ?? "unnamed"}" has no factory.`,
      );
    }

    registration.resolving = true;

    try {
      const instance = registration.factory(this);
      registration.instance = instance;
      registration.hasInstance = true;
      this.creationOrder.push(token);
      return instance;
    } finally {
      registration.resolving = false;
    }
  }

  /**
   * Disposes instantiated services in reverse creation order.
   * Repeated calls are safe. All disposer failures are reported together.
   */
  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    const errors: unknown[] = [];

    for (const token of [...this.creationOrder].reverse()) {
      const registration = this.registrations.get(token);

      if (!registration?.hasInstance || !registration.disposer) {
        continue;
      }

      try {
        await registration.disposer(registration.instance);
      } catch (error: unknown) {
        errors.push(error);
      }
    }

    this.creationOrder.length = 0;
    this.registrations.clear();

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        "One or more services failed during container disposal.",
      );
    }
  }

  private addRegistration<T>(
    token: ServiceToken<T>,
    registration: Registration<T>,
  ): void {
    if (this.registrations.has(token)) {
      throw new Error(
        `A service is already registered for token "${token.description ?? "unnamed"}".`,
      );
    }

    this.registrations.set(
      token,
      registration as unknown as Registration<unknown>,
    );
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error("Dependency container has been disposed.");
    }
  }
}
