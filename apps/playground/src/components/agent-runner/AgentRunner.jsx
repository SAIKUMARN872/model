class AgentRunner {
  constructor() {
    this.isRunning = false;
  }

  async run(agent, input) {
    if (!agent) {
      throw new Error(
        "Agent is required."
      );
    }

    if (!input) {
      throw new Error(
        "Input is required."
      );
    }

    if (this.isRunning) {
      throw new Error(
        "Agent is already running."
      );
    }

    this.isRunning = true;

    try {
      if (
        typeof agent === "function"
      ) {
        return await agent(input);
      }

      if (
        typeof agent.run === "function"
      ) {
        return await agent.run(input);
      }

      throw new Error(
        "Invalid agent. The agent must be a function or have a run method."
      );
    } finally {
      this.isRunning = false;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
    };
  }

  stop() {
    this.isRunning = false;
  }
}

const agentRunner =
  new AgentRunner();

export default agentRunner;