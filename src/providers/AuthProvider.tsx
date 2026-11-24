"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import auth from "../lib/auth";

type AuthContextType = {
  user: any;
  authenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(auth.getUser());
  }, []);

  const login = (token: string, userData: any) => {
    auth.login(token, userData);
    setUser(userData);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      authenticated: !!user,
      login,
      logout,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}