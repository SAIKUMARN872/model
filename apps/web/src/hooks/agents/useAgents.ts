import { useEffect, useState } from "react";

export interface Agent {
  id: number;
  name: string;
  status: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data: Agent[] = [
      {
        id: 1,
        name: "Research Agent",
        status: "Running",
      },
      {
        id: 2,
        name: "Code Agent",
        status: "Idle",
      },
      {
        id: 3,
        name: "Document Agent",
        status: "Running",
      },
    ];

    setAgents(data);
    setLoading(false);
  }, []);

  return {
    agents,
    loading,
  };
}