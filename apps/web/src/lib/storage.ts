export const storage = {
  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  get<T = unknown>(key: string): T | null {
    const value = localStorage.getItem(key);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  remove(key: string) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },
};

export default storage;