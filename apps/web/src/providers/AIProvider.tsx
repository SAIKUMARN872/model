"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

type AIContextType = {
  model: string;
  setModel: (model: string) => void;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [model, setModel] = useState("gpt-4o");

  const value = useMemo(
    () => ({
      model,
      setModel,
    }),
    [model]
  );

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);

  if (!context) {
    throw new Error("useAI must be used inside AIProvider");
  }

  return context;
}