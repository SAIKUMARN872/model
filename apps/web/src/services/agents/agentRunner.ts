export interface AgentTask {
  id: number;
  agent: string;
  prompt: string;
}

export interface AgentResult {
  success: boolean;
  response: string;
}

export async function runAgent(
  task: AgentTask
): Promise<AgentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        response: `${task.agent} completed: ${task.prompt}`,
      });
    }, 1000);
  });
}