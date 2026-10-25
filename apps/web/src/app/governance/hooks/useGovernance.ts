import { useEffect, useState } from "react";

export interface Policy {
  id: number;
  name: string;
  status: string;
}

export function useGovernance() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPolicies([
        {
          id: 1,
          name: "AI Usage Policy",
          status: "Approved",
        },
        {
          id: 2,
          name: "Security Policy",
          status: "Pending",
        },
      ]);

      setLoading(false);
    }, 700);
  }, []);

  return {
    policies,
    loading,
  };
}