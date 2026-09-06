export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

let authState: AuthState = {
  ...initialState,
};

export function getAuthState(): AuthState {
  return {
    ...authState,
  };
}

export function setAuth(
  user: AuthUser,
  token: string
): AuthState {
  authState = {
    user,
    token,
    isAuthenticated: true,
  };

  return getAuthState();
}

export function setUser(
  user: AuthUser | null
): AuthState {
  authState = {
    ...authState,
    user,
    isAuthenticated:
      user !== null &&
      authState.token !== null,
  };

  return getAuthState();
}

export function setToken(
  token: string | null
): AuthState {
  authState = {
    ...authState,
    token,
    isAuthenticated:
      token !== null &&
      authState.user !== null,
  };

  return getAuthState();
}

export function logout(): AuthState {
  authState = {
    ...initialState,
  };

  return getAuthState();
}

export function isAuthenticated(): boolean {
  return authState.isAuthenticated;
}

export function getCurrentUser():
  | AuthUser
  | null {
  return authState.user;
}

export function getToken():
  | string
  | null {
  return authState.token;
}

export default {
  getAuthState,
  setAuth,
  setUser,
  setToken,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken,
};