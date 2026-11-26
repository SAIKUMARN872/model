import { useState } from "react";

export function useAISearch() {
  const [results, setResults] = useState<string[]>([]);

  const search = (query: string) => {
    const data = [
      `${query} Result 1`,
      `${query} Result 2`,
      `${query} Result 3`,
    ];

    setResults(data);
  };

  return {
    results,
    search,
  };
}