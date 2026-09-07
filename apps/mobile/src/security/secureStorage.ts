export class SecureStorage {
  private isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !==
        "undefined"
    );
  }

  public set(
    key: string,
    value: unknown
  ): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const serialized =
        JSON.stringify(value);

      window.localStorage.setItem(
        key,
        serialized
      );
    } catch (error) {
      console.error(
        "Failed to save data:",
        error
      );
    }
  }

  public get<T>(
    key: string
  ): T | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const value =
        window.localStorage.getItem(key);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(
        "Failed to read data:",
        error
      );

      return null;
    }
  }

  public remove(
    key: string
  ): void {
    if (!this.isAvailable()) {
      return;
    }

    window.localStorage.removeItem(key);
  }

  public has(
    key: string
  ): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    return (
      window.localStorage.getItem(
        key
      ) !== null
    );
  }

  public clear(): void {
    if (!this.isAvailable()) {
      return;
    }

    window.localStorage.clear();
  }
}

const secureStorage =
  new SecureStorage();

export default secureStorage;