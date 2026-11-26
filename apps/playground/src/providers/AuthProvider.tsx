import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("auth_user");

      if (savedUser) {
        const parsedUser: unknown = JSON.parse(savedUser);

        if (
          parsedUser !== null &&
          typeof parsedUser === "object" &&
          !Array.isArray(parsedUser)
        ) {
          setUser(parsedUser as AuthUser);
        }
      }
    } catch (error) {
      console.error("Failed to restore authentication:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: AuthUser): void => {
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const updateUser = (updates: Partial<AuthUser>): void => {
    setUser((previous) => {
      const updatedUser: AuthUser = {
        ...(previous ?? {}),
        ...updates,
      };

      localStorage.setItem(
        "auth_user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export default AuthContext;
