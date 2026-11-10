import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { AuthService } from "../auth/AuthService.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const verifiedSession = await AuthService.getSession();
      setSession(verifiedSession);
      setStatus("authenticated");
      return verifiedSession;
    } catch (cause) {
      setSession(null);
      setStatus("unauthenticated");
      setError(cause);
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);

    try {
      await AuthService.signOut();
    } catch (cause) {
      setError(cause);
      throw cause;
    } finally {
      setSession(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    let active = true;

    AuthService.getSession()
      .then(value => {
        if (!active) return;
        setSession(value);
        setStatus("authenticated");
      })
      .catch(cause => {
        if (!active) return;
        setSession(null);
        setStatus("unauthenticated");
        setError(cause);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    status,
    loading: status === "loading",
    authenticated: status === "authenticated",
    error,
    refreshSession,
    signOut
  }), [session, status, error, refreshSession, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

export default AuthProvider;
