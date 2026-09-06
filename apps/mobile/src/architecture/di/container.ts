export type Factory<T> = () => T;

export class Container {
  private services: Map<string, unknown> = new Map();

  public register<T>(
    name: string,
    factory: Factory<T>
  ): void {
    if (!name.trim()) {
      throw new Error("Service name is required.");
    }

    this.services.set(name, factory());
  }

  public registerInstance<T>(
    name: string,
    instance: T
  ): void {
    if (!name.trim()) {
      throw new Error("Service name is required.");
    }

    this.services.set(name, instance);
  }

  public resolve<T>(name: string): T {
    if (!this.services.has(name)) {
      throw new Error(
        `Service "${name}" is not registered.`
      );
    }

    return this.services.get(name) as T;
  }

  public has(name: string): boolean {
    return this.services.has(name);
  }

  public remove(name: string): boolean {
    return this.services.delete(name);
  }

  public clear(): void {
    this.services.clear();
  }

  public count(): number {
    return this.services.size;
  }
}

const container = new Container();

export default container;