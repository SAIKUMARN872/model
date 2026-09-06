"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem(
          "auth_user"
        );

      if (savedUser) {
        setUser(
          JSON.parse(savedUser)
        );
      }
    } catch (error) {
      console.error(
        "Failed to restore authentication:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (
    userData
  ) => {
    setUser(userData);

    localStorage.setItem(
      "auth_user",
      JSON.stringify(userData)
    );
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(
      "auth_user"
    );
  };

  const updateUser = (
    updates
  ) => {
    setUser((previous) => {
      const updatedUser = {
        ...previous,
        ...updates,
      };

      localStorage.setItem(
        "auth_user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated:
      Boolean(user),
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}

export default AuthContext;