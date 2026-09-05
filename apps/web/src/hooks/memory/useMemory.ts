import { useState } from "react";

export function useMemory() {
  const [memory, setMemory] = useState<string[]>([]);

  const addMemory = (value: string) => {
    setMemory((prev) => [...prev, value]);
  };

  const clearMemory = () => {
    setMemory([]);
  };

  return {
    memory,
    addMemory,
    clearMemory,
  };
}