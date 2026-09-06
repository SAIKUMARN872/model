export interface DependencyContainer {
  register<T>(
    name: string,
    dependency: T
  ): void;

  resolve<T>(
    name: string
  ): T | undefined;

  has(
    name: string
  ): boolean;

  remove(
    name: string
  ): boolean;

  clear(): void;
}

class Container
  implements DependencyContainer
{
  private dependencies: Map<
    string,
    unknown
  > = new Map();

  public register<T>(
    name: string,
    dependency: T
  ): void {
    if (!name.trim()) {
      throw new Error(
        "Dependency name is required."
      );
    }

    this.dependencies.set(
      name,
      dependency
    );
  }

  public resolve<T>(
    name: string
  ): T | undefined {
    return this.dependencies.get(
      name
    ) as T | undefined;
  }

  public has(
    name: string
  ): boolean {
    return this.dependencies.has(
      name
    );
  }

  public remove(
    name: string
  ): boolean {
    return this.dependencies.delete(
      name
    );
  }

  public clear(): void {
    this.dependencies.clear();
  }
}

export const dependencyContainer =
  new Container();

export default dependencyContainer;