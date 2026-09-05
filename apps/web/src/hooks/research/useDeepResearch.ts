import { useState } from "react";

export function useDeepResearch() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const research = async (query: string) => {
    setLoading(true);

    setTimeout(() => {
      setResult(`Research completed for "${query}"`);
      setLoading(false);
    }, 1000);
  };

  return {
    loading,
    result,
    research,
  };
}