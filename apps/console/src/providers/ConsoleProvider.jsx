import React, { createContext, useContext, useMemo } from "react";
import { consoleConfig } from "../config/console.js";

const ConsoleContext = createContext(null);

export function ConsoleProvider({ children, config = consoleConfig }) {
  const value = useMemo(() => {
    if (!config || typeof config !== "object") {
      throw new TypeError("Console configuration must be an object.");
    }

    return Object.freeze({
      apiBaseUrl: config.apiBaseUrl,
      requestTimeoutMs: config.requestTimeoutMs
    });
  }, [config]);

  return (
    <ConsoleContext.Provider value={value}>
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error("useConsole must be used inside ConsoleProvider.");
  }
  return context;
}

export default ConsoleProvider;
