
import { useState } from "react";
import {
  Bot,
  Plus,
  Search,
  Trash2,
  MessageSquare,
  Globe,
  Database,
  Code2,
  CheckCircle2,
  Play,
  Settings2,
} from "lucide-react";

import "./agents.css";

type Agent = {
  id: number;
  name: string;
  description: string;
  instructions: string;
  tools: string[];
};

const DEFAULT_INSTRUCTIONS =
  "You are a helpful AI assistant. Follow the user's instructions carefully.";

const availableTools = [
  {
    name: "Web Search",
    description: "Search information from the web.",
    icon: Globe,
  },
  {
    name: "Knowledge Hub",
    description: "Use connected knowledge sources.",
    icon: Database,
  },
  {
    name: "Code Interpreter",
    description: "Prepare and analyze code.",
    icon: Code2,
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [name, setName] = useState("New AI Agent");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);

  const [tools, setTools] = useState<string[]>(["Web Search"]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const selected = agents.find(
    (agent) => agent.id === selectedId
  );

  // Reset editor

  const resetEditor = () => {
    setName("New AI Agent");
    setDescription("");
    setInstructions(DEFAULT_INSTRUCTIONS);
    setTools(["Web Search"]);
    setPreview([]);
    setMessage("");
    setSaved(false);
  };

  // Create agent

  const createAgent = () => {
    const agent: Agent = {
      id: Date.now(),
      name: "New AI Agent",
      description: "",
      instructions: DEFAULT_INSTRUCTIONS,
      tools: ["Web Search"],
    };

    setAgents((old) => [agent, ...old]);
    setSelectedId(agent.id);

    setName(agent.name);
    setDescription(agent.description);
    setInstructions(agent.instructions);
    setTools(agent.tools);

    setPreview([]);
    setSaved(false);
  };

  // Open agent

  const openAgent = (agent: Agent) => {
    setSelectedId(agent.id);
    setName(agent.name);
    setDescription(agent.description);
    setInstructions(agent.instructions);
    setTools([...agent.tools]);
    setPreview([]);
    setMessage("");
    setSaved(true);
  };

  // Toggle tools

  const toggleTool = (tool: string) => {
    setTools((old) =>
      old.includes(tool)
        ? old.filter((item) => item !== tool)
        : [...old, tool]
    );

    setSaved(false);
  };

  // Save configuration

  const saveAgent = () => {
    if (!selectedId || !name.trim()) return;

    setAgents((old) =>
      old.map((agent) =>
        agent.id === selectedId
          ? {
              ...agent,
              name: name.trim(),
              description: description.trim(),
              instructions,
              tools,
            }
          : agent
      )
    );

    setSaved(true);
  };

  // Delete agent

  const deleteAgent = (id: number) => {
    setAgents((old) =>
      old.filter((agent) => agent.id !== id)
    );

    if (selectedId === id) {
      setSelectedId(null);
      resetEditor();
    }
  };

  // Test preview

  const sendPreview = () => {
    if (!message.trim()) return;

    if (!saved) {
      window.alert("Please save your agent configuration before testing.");
      return;
    }

    setPreview((old) => [
      ...old,
      `You: ${message.trim()}`,
      "Preview: This is a local agent configuration preview. Connect the Agent API to receive a real model-generated response.",
    ]);

    setMessage("");
  };

  // Search agents

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="wt-page">

      {/* Agent Workspace */}

      <div className="wt-agent-layout">

        {/* Sidebar */}

        <aside className="wt-panel wt-agent-sidebar">

          <div className="wt-panel-heading wt-space-between">
            <div>
              <h2>Your agents</h2>
              <p>{agents.length} configured</p>
            </div>

            <button
              className="wt-icon-button"
              onClick={createAgent}
              title="Create agent"
              type="button"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="wt-search">
            <Search size={16} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search agents..."
            />
          </div>

          <div className="wt-agent-list">

            {filteredAgents.length === 0 ? (
              <div className="wt-agent-empty">
                {agents.length === 0
                  ? "No agents yet. Create your first agent to get started."
                  : "No matching agents found."}
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  className={`wt-agent-item ${
                    selectedId === agent.id
                      ? "wt-agent-active"
                      : ""
                  }`}
                  onClick={() => openAgent(agent)}
                >
                  <span className="wt-agent-avatar">
                    <Bot size={18} />
                  </span>

                  <span className="wt-agent-item-text">
                    <strong>{agent.name}</strong>
                    <small>
                      {agent.description || "No description"}
                    </small>
                  </span>
                </button>
              ))
            )}

          </div>
        </aside>

        {/* Main Editor */}

        {selected ? (
          <div className="wt-agent-main">

            {/* Configuration */}

            <section className="wt-panel">

              <div className="wt-panel-heading wt-space-between">
                <div>
                  <h2>
                    <Settings2 size={18} />
                    Agent configuration
                  </h2>

                  <p>
                    Define the identity, behavior, and tools for this agent.
                  </p>
                </div>

                <button
                  type="button"
                  className="wt-icon-button wt-danger"
                  title="Delete agent"
                  onClick={() => deleteAgent(selected.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="wt-field">
                <label htmlFor="agent-name">
                  Agent name
                </label>

                <input
                  id="agent-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Enter agent name"
                />
              </div>

              <div className="wt-field">
                <label htmlFor="agent-description">
                  Description
                </label>

                <input
                  id="agent-description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="What does this agent do?"
                />
              </div>

              <div className="wt-field">
                <label htmlFor="agent-instructions">
                  System instructions
                </label>

                <textarea
                  id="agent-instructions"
                  rows={6}
                  value={instructions}
                  onChange={(event) => {
                    setInstructions(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Describe how your agent should behave..."
                />

                <span className="wt-help">
                  These instructions define the agent's role and response behavior.
                </span>
              </div>

              <div className="wt-actions">
                <button
                  type="button"
                  className="wt-primary"
                  onClick={saveAgent}
                  disabled={!name.trim()}
                >
                  <CheckCircle2 size={16} />
                  Save configuration
                </button>

                {saved && (
                  <span className="wt-note">
                    Configuration saved
                  </span>
                )}
              </div>

            </section>

            {/* Tools */}

            <section className="wt-panel">

              <div className="wt-panel-heading">
                <div>
                  <h2>Agent tools</h2>
                  <p>
                    Choose the capabilities available to this agent.
                  </p>
                </div>
              </div>

              <div className="wt-tool-list">

                {availableTools.map((tool) => {
                  const Icon = tool.icon;
                  const enabled = tools.includes(tool.name);

                  return (
                    <div className="wt-tool-row" key={tool.name}>

                      <span className="wt-tool-icon">
                        <Icon size={19} />
                      </span>

                      <div className="wt-tool-copy">
                        <strong>{tool.name}</strong>
                        <span>{tool.description}</span>
                      </div>

                      <label className="wt-switch">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleTool(tool.name)}
                        />
                        <span />
                      </label>

                    </div>
                  );
                })}

              </div>

              <p className="wt-note">
                Tool switches save with the agent configuration.
                Actual tool execution requires backend integration.
              </p>

            </section>

            {/* Agent Testing */}

            <section className="wt-panel">

              <div className="wt-panel-heading">
                <div>
                  <h2>
                    <MessageSquare size={18} />
                    Test agent
                  </h2>

                  <p>
                    Preview your configuration before connecting the live agent runtime.
                  </p>
                </div>
              </div>

              <div className="wt-preview">

                {preview.length === 0 ? (
                  <div className="wt-empty">
                    <Bot size={27} />

                    <h3>Test your agent configuration</h3>

                    <p>
                      Send a message to see the local preview response.
                    </p>
                  </div>
                ) : (
                  preview.map((item, index) => (
                    <div
                      className={`wt-preview-message ${
                        item.startsWith("You:")
                          ? "wt-preview-user"
                          : ""
                      }`}
                      key={index}
                    >
                      {item}
                    </div>
                  ))
                )}

              </div>

              <div className="wt-chat-input">

                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      sendPreview();
                    }
                  }}
                  placeholder="Send a test message..."
                />

                <button
                  type="button"
                  className="wt-primary"
                  onClick={sendPreview}
                  disabled={!message.trim() || !saved}
                >
                  <Play size={15} />
                  Test
                </button>

              </div>

            </section>

          </div>
        ) : (

          /* Empty Workspace */

          <section className="wt-panel wt-agent-welcome">

            <div className="wt-empty">

              <div className="wt-empty-icon">
                <Bot size={28} />
              </div>

              <h2>Create your first AI agent</h2>

              <p>
                Configure its instructions, enable tools,
                and prepare it for testing.
              </p>

              <button
                type="button"
                className="wt-primary"
                onClick={createAgent}
              >
                <Plus size={16} />
                Create agent
              </button>

            </div>

          </section>

        )}

      </div>

    </div>
  );
}
