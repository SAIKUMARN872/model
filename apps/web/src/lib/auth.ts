import storage from "./storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user";

export const auth = {
  login(token: string, user?: unknown) {
    storage.set(TOKEN_KEY, token);

    if (user) {
      storage.set(USER_KEY, user);
    }
  },

  logout() {
    storage.remove(TOKEN_KEY);
    storage.remove(USER_KEY);
  },

  getToken(): string | null {
    return storage.get<string>(TOKEN_KEY);
  },

  getUser<T = unknown>(): T | null {
    return storage.get<T>(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default auth;