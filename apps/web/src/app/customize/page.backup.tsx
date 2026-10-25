"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  FileText,
  Globe,
  GraduationCap,
  Layers3,
  LayoutGrid,
  MessageCircle,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Wrench,
  X,
  Pencil,
  Trash2,
  Palette,
  BriefcaseBusiness,
  Plug,
  SlidersHorizontal,
  CircleCheck,
  SearchCode,
} from "lucide-react";

type Tab = "skills" | "connectors";

type Skill = {
  id: string;
  name: string;
  description: string;
  publisher: string;
  category: string;
  enabled: boolean;
};

type Connector = {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
};

const initialSkills: Skill[] = [
  {
    id: "design",
    name: "Design",
    description:
      "Improve product design, UX writing, design systems, and creative workflows.",
    publisher: "ModelNow",
    category: "Design",
    enabled: false,
  },
  {
    id: "engineering",
    name: "Engineering",
    description:
      "Support software architecture, debugging, code review, and development.",
    publisher: "ModelNow",
    category: "Development",
    enabled: false,
  },
  {
    id: "figma",
    name: "Figma",
    description:
      "Work with design files, reusable components, and product design workflows.",
    publisher: "Figma",
    category: "Design",
    enabled: false,
  },
  {
    id: "seo",
    name: "SearchFit SEO",
    description:
      "Audit websites, plan content, and improve search visibility.",
    publisher: "SearchFit.ai",
    category: "Marketing",
    enabled: false,
  },
  {
    id: "desktop-commander",
    name: "Desktop Commander",
    description:
      "Assist with terminal commands, file operations, and desktop workflows.",
    publisher: "ModelNow",
    category: "Productivity",
    enabled: false,
  },
  {
    id: "research",
    name: "Research Assistant",
    description:
      "Research topics, organize findings, and prepare clear reports.",
    publisher: "ModelNow",
    category: "Research",
    enabled: true,
  },
  {
    id: "writing",
    name: "Writing Assistant",
    description:
      "Draft and improve emails, reports, documents, and other content.",
    publisher: "ModelNow",
    category: "Writing",
    enabled: false,
  },
  {
    id: "code-review",
    name: "Code Reviewer",
    description:
      "Review code for bugs, readability, maintainability, and improvements.",
    publisher: "ModelNow",
    category: "Development",
    enabled: true,
  },
  {
    id: "corbis",
    name: "Corbis",
    description:
      "Find source-grounded information and turn findings into useful summaries.",
    publisher: "ModelNow",
    category: "Research",
    enabled: false,
  },
  {
    id: "finance-tutor",
    name: "Finance Tutor",
    description:
      "Learn financial concepts through accessible educational explanations.",
    publisher: "ModelNow",
    category: "Education",
    enabled: false,
  },
  {
    id: "partner-managers",
    name: "EULER for Partner Managers",
    description:
      "Support partner relationships, account workflows, and customer coordination.",
    publisher: "ModelNow",
    category: "Business",
    enabled: false,
  },
  {
    id: "learning",
    name: "Learn",
    description:
      "Understand unfamiliar topics through explanations and guided learning.",
    publisher: "ModelNow",
    category: "Education",
    enabled: false,
  },
  {
    id: "doc-coauthoring",
    name: "Doc Coauthoring",
    description:
      "Plan, write, and improve documents through collaborative workflows.",
    publisher: "ModelNow",
    category: "Writing",
    enabled: false,
  },
  {
    id: "web-artifacts",
    name: "Web Artifacts Builder",
    description:
      "Create interactive web experiences, components, and prototypes.",
    publisher: "ModelNow",
    category: "Development",
    enabled: false,
  },
];

const initialConnectors: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect repositories and support development workflows.",
    category: "Development",
    connected: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Organize documents and workspace files.",
    category: "Files",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Bring team conversations into your workflows.",
    category: "Communication",
    connected: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect notes, documents, and knowledge workspace content.",
    category: "Knowledge",
    connected: false,
  },
  {
    id: "web",
    name: "Web Search",
    description: "Search the web for research and current information.",
    category: "Research",
    connected: false,
  },
  {
    id: "files",
    name: "File Workspace",
    description: "Organize files and prepare information for workflows.",
    category: "Files",
    connected: false,
  },
];

const categories = [
  "All skills",
  "Development",
  "Design",
  "Research",
  "Writing",
  "Productivity",
  "Education",
  "Business",
  "Marketing",
];

function CategoryIcon({ category }: { category: string }) {
  const props = { size: 18, strokeWidth: 1.8 };

  switch (category) {
    case "Development":
      return <Code2 {...props} />;
    case "Design":
      return <Palette {...props} />;
    case "Research":
      return <Globe {...props} />;
    case "Writing":
      return <FileText {...props} />;
    case "Productivity":
      return <Wrench {...props} />;
    case "Education":
      return <GraduationCap {...props} />;
    case "Business":
      return <BriefcaseBusiness {...props} />;
    case "Marketing":
      return <SearchCode {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

function SkillCard({
  skill,
  onToggle,
  onTry,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  onToggle: (id: string) => void;
  onTry: (skill: Skill) => void;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
}) {
  const isCustom = skill.id.startsWith("custom-");

  return (
    <article className="skill-card">
      <div className="card-top">
        <div className={`skill-icon icon-${skill.category.toLowerCase()}`}>
          <CategoryIcon category={skill.category} />
        </div>

        <div className="card-menu">
          {skill.enabled && (
            <span className="added-badge">
              <Check size={12} />
              Added
            </span>
          )}

          <button
            className="small-icon-button"
            type="button"
            onClick={() => onEdit(skill)}
            title="Edit skill"
            aria-label={`Edit ${skill.name}`}
          >
            <Pencil size={15} />
          </button>

          {isCustom && (
            <button
              className="small-icon-button danger-icon"
              type="button"
              onClick={() => onDelete(skill.id)}
              title="Delete skill"
              aria-label={`Delete ${skill.name}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="skill-card-content">
        <h3>{skill.name}</h3>
        <p className="skill-description">{skill.description}</p>
      </div>

      <div className="card-footer">
        <div className="publisher">
          <span className="publisher-dot">
            <Sparkles size={11} />
          </span>
          <span>{skill.publisher}</span>
        </div>

        <div className="card-buttons">
          <button
            type="button"
            className="try-button"
            onClick={() => onTry(skill)}
          >
            <MessageCircle size={14} />
            Try
          </button>

          <button
            type="button"
            className={skill.enabled ? "added-button" : "add-button"}
            onClick={() => onToggle(skill.id)}
            title={skill.enabled ? "Remove skill" : "Add skill"}
          >
            {skill.enabled ? <Check size={16} /> : <Plus size={16} />}
            <span>{skill.enabled ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function ConnectorCard({
  connector,
  onToggle,
}: {
  connector: Connector;
  onToggle: (id: string) => void;
}) {
  const icon =
    connector.id === "github" ? (
      <Code2 size={23} />
    ) : connector.id === "google-drive" ? (
      <Layers3 size={23} />
    ) : connector.id === "slack" ? (
      <MessageCircle size={23} />
    ) : connector.id === "notion" ? (
      <FileText size={23} />
    ) : connector.id === "web" ? (
      <Globe size={23} />
    ) : (
      <Plug size={23} />
    );

  return (
    <article className="connector-card">
      <div className="connector-top">
        <div className="connector-icon">{icon}</div>
        {connector.connected && (
          <span className="connected-badge">
            <CircleCheck size={13} />
            Connected
          </span>
        )}
      </div>

      <h3>{connector.name}</h3>
      <p>{connector.description}</p>

      <div className="connector-footer">
        <span>{connector.category}</span>
        <button
          type="button"
          className={connector.connected ? "disconnect-button" : "connect-button"}
          onClick={() => onToggle(connector.id)}
        >
          {connector.connected ? "Disconnect" : "Connect"}
          <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

function SkillModal({
  editing,
  name,
  description,
  setName,
  setDescription,
  onSave,
  onClose,
}: {
  editing: boolean;
  name: string;
  description: string;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="skill-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-icon">
            <Sparkles size={20} />
          </div>
          <button
            type="button"
            className="small-icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="modal-title">
          {editing ? "Edit your skill" : "Create a new skill"}
        </h2>
        <p className="modal-description">
          Define a reusable AI capability for your ModelNow workspace.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <label htmlFor="skill-name">Skill name</label>
          <input
            id="skill-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Product research"
            maxLength={80}
            required
            autoFocus
          />

          <label htmlFor="skill-description">Description</label>
          <textarea
            id="skill-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What should this skill help you do?"
            rows={4}
            maxLength={500}
          />

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={!name.trim()}
            >
              {editing ? "Save changes" : "Create skill"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function CustomisePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("skills");
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [connectors, setConnectors] =
    useState<Connector[]>(initialConnectors);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All skills");
  const [view, setView] = useState<"explore" | "added">("explore");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");

  const query = search.trim().toLowerCase();

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch =
        `${skill.name} ${skill.description} ${skill.category} ${skill.publisher}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All skills" || skill.category === category;

      const matchesView = view === "explore" || skill.enabled;

      return matchesSearch && matchesCategory && matchesView;
    });
  }, [skills, query, category, view]);

  const filteredConnectors = useMemo(() => {
    return connectors.filter((connector) =>
      `${connector.name} ${connector.description} ${connector.category}`
        .toLowerCase()
        .includes(query)
    );
  }, [connectors, query]);

  const enabledCount = skills.filter((skill) => skill.enabled).length;
  const connectedCount = connectors.filter(
    (connector) => connector.connected
  ).length;

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setSearch("");
    setCategory("All skills");
    setView("explore");
  }

  function toggleSkill(id: string) {
    setSkills((current) =>
      current.map((skill) =>
        skill.id === id ? { ...skill, enabled: !skill.enabled } : skill
      )
    );
  }

  function toggleConnector(id: string) {
    setConnectors((current) =>
      current.map((connector) =>
        connector.id === id
          ? { ...connector, connected: !connector.connected }
          : connector
      )
    );
  }

  function openCreateSkill() {
    setEditingId(null);
    setSkillName("");
    setSkillDescription("");
    setModalOpen(true);
  }

  function openEditSkill(skill: Skill) {
    setEditingId(skill.id);
    setSkillName(skill.name);
    setSkillDescription(skill.description);
    setModalOpen(true);
  }

  function saveSkill() {
    const name = skillName.trim();
    const description = skillDescription.trim();

    if (!name) return;

    if (editingId) {
      setSkills((current) =>
        current.map((skill) =>
          skill.id === editingId
            ? { ...skill, name, description }
            : skill
        )
      );
    } else {
      const newSkill: Skill = {
        id: `custom-${Date.now()}`,
        name,
        description,
        publisher: "ModelNow",
        category: "Custom",
        enabled: false,
      };

      setSkills((current) => [newSkill, ...current]);
      setCategory("All skills");
      setView("explore");
      setSearch("");
    }

    setModalOpen(false);
  }

  function deleteSkill(id: string) {
    if (!id.startsWith("custom-")) return;

    const confirmed = window.confirm("Delete this custom skill?");
    if (!confirmed) return;

    setSkills((current) => current.filter((skill) => skill.id !== id));
  }

  function trySkill(skill: Skill) {
    router.push(`/chat?skill=${encodeURIComponent(skill.name)}`);
  }

  return (
    <main className="workspace">
      <header className="topbar">
        <button
          type="button"
          className="back-link"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft size={17} />
          <span>Back to chat</span>
        </button>

        <button
          type="button"
          className="brand"
          onClick={() => router.push("/chat")}
          aria-label="ModelNow home"
        >
          <span className="brand-symbol">
            <Sparkles size={18} />
          </span>
          <span>ModelNow</span>
          <span className="brand-divider" />
          <span className="brand-product">Workspace</span>
        </button>

        <div className="topbar-actions">
          <span className="cloud-status">
            <span className="online-dot" />
            AI workspace
          </span>
          <button
            type="button"
            className="create-button"
            onClick={openCreateSkill}
          >
            <Plus size={17} />
            Create skill
          </button>
        </div>
      </header>

      <div className="workspace-layout">
        <aside className="sidebar">
          <p className="sidebar-label">WORKSPACE</p>

          <button
            type="button"
            className={`sidebar-item ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => switchTab("skills")}
          >
            <Sparkles size={18} />
            <span>Skills</span>
            <span className="sidebar-count">{skills.length}</span>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeTab === "connectors" ? "active" : ""}`}
            onClick={() => switchTab("connectors")}
          >
            <Plug size={18} />
            <span>Connectors</span>
            <span className="sidebar-count">{connectors.length}</span>
          </button>

          <div className="sidebar-divider" />

          <p className="sidebar-label">
            {activeTab === "skills" ? "SKILL CATEGORIES" : "INTEGRATIONS"}
          </p>

          {activeTab === "skills" ? (
            categories.map((item) => (
              <button
                type="button"
                key={item}
                className={`sidebar-item category-item ${
                  category === item ? "active" : ""
                }`}
                onClick={() => {
                  setCategory(item);
                  setView("explore");
                }}
              >
                <CategoryIcon category={item} />
                <span>{item}</span>
              </button>
            ))
          ) : (
            <div className="sidebar-note">
              Connect your tools to bring your work into ModelNow.
            </div>
          )}

          <div className="sidebar-bottom">
            <div className="sidebar-tip-icon">
              <Sparkles size={17} />
            </div>
            <strong>Make AI work your way</strong>
            <p>
              Add skills and organize the capabilities you use most.
            </p>
            <button
              type="button"
              onClick={() =>
                activeTab === "skills"
                  ? openCreateSkill()
                  : switchTab("connectors")
              }
            >
              Explore workspace <ArrowRight size={14} />
            </button>
          </div>
        </aside>

        <section className="main-panel">
          <div className="page-heading">
            <div>
              <div className="breadcrumb">
                <span>Workspace</span>
                <span>/</span>
                <span>{activeTab === "skills" ? "Skills" : "Connectors"}</span>
              </div>

              <h1>
                {activeTab === "skills" ? "Skills library" : "Connectors"}
              </h1>

              <p>
                {activeTab === "skills"
                  ? "Discover and manage AI capabilities for your work."
                  : "Connect your tools and bring your workflows together."}
              </p>
            </div>

            <div className="heading-metrics">
              <div className="metric-icon">
                {activeTab === "skills" ? (
                  <Sparkles size={20} />
                ) : (
                  <Plug size={20} />
                )}
              </div>
              <div>
                <strong>
                  {activeTab === "skills" ? enabledCount : connectedCount}
                </strong>
                <span>
                  {activeTab === "skills"
                    ? "Skills added"
                    : "Connected tools"}
                </span>
              </div>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "skills"
                    ? "Search skills by name, category, or capability..."
                    : "Search connectors..."
                }
                aria-label={
                  activeTab === "skills" ? "Search skills" : "Search connectors"
                }
              />
              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <span className="search-shortcut">
                <Search size={12} />
              </span>
            </div>

            <button
              type="button"
              className="filter-button"
              onClick={() => {
                setCategory("All skills");
                setView("explore");
              }}
            >
              <SlidersHorizontal size={16} />
              Filters
              <ChevronDown size={14} />
            </button>
          </div>

          {activeTab === "skills" ? (
            <>
              <div className="view-switcher">
                <button
                  type="button"
                  className={view === "explore" ? "selected" : ""}
                  onClick={() => setView("explore")}
                >
                  <LayoutGrid size={16} />
                  Explore skills
                </button>
                <button
                  type="button"
                  className={view === "added" ? "selected" : ""}
                  onClick={() => setView("added")}
                >
                  <Check size={16} />
                  Added skills
                  <span>{enabledCount}</span>
                </button>
              </div>

              <div className="results-heading">
                <div>
                  <h2>
                    {query
                      ? "Search results"
                      : view === "added"
                        ? "Your added skills"
                        : category === "All skills"
                          ? "Explore skills"
                          : category}
                  </h2>
                  <p>
                    {filteredSkills.length}{" "}
                    {filteredSkills.length === 1 ? "skill" : "skills"} available
                  </p>
                </div>

                <div className="sort-label">
                  <Settings2 size={15} />
                  Recommended
                </div>
              </div>

              {filteredSkills.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Search size={22} />
                  </div>
                  <h3>No skills found</h3>
                  <p>
                    Try a different search or choose another category.
                  </p>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => {
                      setSearch("");
                      setCategory("All skills");
                      setView("explore");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="skills-grid">
                  {filteredSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onToggle={toggleSkill}
                      onTry={trySkill}
                      onEdit={openEditSkill}
                      onDelete={deleteSkill}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="results-heading connector-results-heading">
                <div>
                  <h2>Available integrations</h2>
                  <p>
                    {filteredConnectors.length} tools in your connector library
                  </p>
                </div>
                <span className="connector-info">
                  <Plug size={15} />
                  Tool connections
                </span>
              </div>

              {filteredConnectors.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Search size={22} />
                  </div>
                  <h3>No connectors found</h3>
                  <p>Try searching for a different tool.</p>
                </div>
              ) : (
                <div className="skills-grid connector-grid">
                  {filteredConnectors.map((connector) => (
                    <ConnectorCard
                      key={connector.id}
                      connector={connector}
                      onToggle={toggleConnector}
                    />
                  ))}
                </div>
              )}

              <div className="integration-disclaimer">
                <div className="disclaimer-icon">
                  <Plug size={17} />
                </div>
                <div>
                  <strong>Connect your tools</strong>
                  <p>
                    These buttons currently update the local interface only.
                    Real account authorization and external data access require
                    provider integrations.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {modalOpen && (
        <SkillModal
          editing={editingId !== null}
          name={skillName}
          description={skillDescription}
          setName={setSkillName}
          setDescription={setSkillDescription}
          onSave={saveSkill}
          onClose={() => setModalOpen(false)}
        />
      )}

      <style jsx>{`
        .workspace {
          min-height: 100vh;
          background: #f7f8fc;
          color: #20263a;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        button,
        input,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #818cf8;
          outline-offset: 3px;
        }

        .topbar {
          height: 68px;
          padding: 0 30px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 22px;
          background: #ffffff;
          border-bottom: 1px solid #e9ebf3;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          justify-self: start;
          gap: 9px;
          border: 0;
          background: transparent;
          color: #737b91;
          font-size: 12px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          border: 0;
          background: transparent;
          color: #20263a;
          font-size: 16px;
          font-weight: 750;
          letter-spacing: -0.45px;
        }

        .brand-symbol {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: linear-gradient(140deg, #7167f8, #9a8bff);
          color: #fff;
        }

        .brand-divider {
          width: 1px;
          height: 22px;
          margin: 0 2px;
          background: #e4e7f0;
        }

        .brand-product {
          color: #8991a6;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          justify-self: end;
          gap: 18px;
        }

        .cloud-status {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #727b91;
          font-size: 11px;
          white-space: nowrap;
        }

        .online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #30b982;
          box-shadow: 0 0 0 3px #e8f8f0;
        }

        .create-button,
        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border: 1px solid #6558e8;
          border-radius: 9px;
          background: #6558e8;
          color: #fff;
          font-size: 12px;
          font-weight: 650;
          box-shadow: 0 3px 8px rgba(101, 88, 232, 0.13);
          transition:
            background 150ms ease,
            transform 150ms ease;
        }

        .create-button:hover,
        .primary-button:hover:not(:disabled) {
          background: #5145d4;
          transform: translateY(-1px);
        }

        .workspace-layout {
          display: grid;
          grid-template-columns: 244px minmax(0, 1fr);
          min-height: calc(100vh - 68px);
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          padding: 27px 15px 20px;
          background: #fff;
          border-right: 1px solid #e9ebf3;
        }

        .sidebar-label {
          margin: 0 10px 12px;
          color: #9aa1b4;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.25px;
        }

        .sidebar-item {
          width: 100%;
          min-height: 41px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 11px;
          margin-bottom: 4px;
          border: 1px solid transparent;
          border-radius: 9px;
          background: transparent;
          color: #737b91;
          text-align: left;
          font-size: 12px;
          transition:
            color 150ms ease,
            background 150ms ease;
        }

        .sidebar-item:hover {
          background: #f7f7fd;
          color: #3e4662;
        }

        .sidebar-item.active {
          border-color: #e5e2ff;
          background: #f0efff;
          color: #5d51dd;
          font-weight: 700;
        }

        .sidebar-item > span:nth-child(2) {
          flex: 1;
        }

        .sidebar-count {
          color: #9299ae;
          font-size: 10px;
        }

        .sidebar-divider {
          height: 1px;
          margin: 18px 8px 22px;
          background: #eceef5;
        }

        .category-item {
          min-height: 38px;
        }

        .sidebar-note {
          padding: 10px;
          color: #81899e;
          font-size: 12px;
          line-height: 1.7;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding: 16px 14px;
          border: 1px solid #e6e5ff;
          border-radius: 13px;
          background: linear-gradient(145deg, #f6f5ff, #fbfaff);
        }

        .sidebar-tip-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          margin-bottom: 13px;
          border-radius: 10px;
          background: #e9e6ff;
          color: #6558e8;
        }

        .sidebar-bottom strong {
          display: block;
          color: #343b55;
          font-size: 12px;
        }

        .sidebar-bottom p {
          margin: 7px 0 13px;
          color: #81879c;
          font-size: 11px;
          line-height: 1.65;
        }

        .sidebar-bottom button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #6155dd;
          font-size: 10px;
          font-weight: 700;
        }

        .main-panel {
          min-width: 0;
          padding: 34px clamp(20px, 3.4vw, 48px) 60px;
        }

        .page-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 27px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 13px;
          color: #9299ad;
          font-size: 11px;
        }

        .breadcrumb span:last-child {
          color: #5d65a0;
          font-weight: 650;
        }

        .page-heading h1 {
          margin: 0;
          color: #20263a;
          font-size: clamp(25px, 2.5vw, 32px);
          font-weight: 750;
          letter-spacing: -1.1px;
          line-height: 1.2;
        }

        .page-heading > div:first-child > p {
          margin: 9px 0 0;
          color: #858ca1;
          font-size: 12px;
          line-height: 1.7;
        }

        .heading-metrics {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          padding: 13px 16px;
          border: 1px solid #e8e9f3;
          border-radius: 12px;
          background: #fff;
        }

        .metric-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #f0efff;
          color: #6558e8;
        }

        .heading-metrics strong,
        .heading-metrics span {
          display: block;
        }

        .heading-metrics strong {
          color: #303751;
          font-size: 18px;
          line-height: 1.2;
        }

        .heading-metrics span {
          margin-top: 4px;
          color: #8a91a6;
          font-size: 10px;
          white-space: nowrap;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 23px;
        }

        .search-field {
          min-width: 0;
          height: 45px;
          display: flex;
          align-items: center;
          flex: 1;
          gap: 10px;
          padding: 0 13px;
          border: 1px solid #e4e7f0;
          border-radius: 10px;
          background: #fff;
          color: #9198ac;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease;
        }

        .search-field:focus-within {
          border-color: #aaa3f5;
          box-shadow: 0 0 0 3px rgba(101, 88, 232, 0.08);
        }

        .search-field input {
          width: 100%;
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: #30364b;
          font-size: 12px;
        }

        .search-field input::placeholder {
          color: #a0a6b7;
        }

        .clear-search,
        .small-icon-button {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          padding: 0;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #858da3;
        }

        .clear-search:hover,
        .small-icon-button:hover {
          border-color: #e7e8f1;
          background: #f7f7fc;
          color: #4d5571;
        }

        .search-shortcut {
          display: grid;
          place-items: center;
          width: 23px;
          height: 23px;
          border: 1px solid #e6e8f0;
          border-radius: 6px;
          color: #a1a7b7;
        }

        .filter-button {
          height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 13px;
          border: 1px solid #e4e7f0;
          border-radius: 10px;
          background: #fff;
          color: #636b82;
          font-size: 11px;
          white-space: nowrap;
        }

        .filter-button:hover {
          background: #f8f8fc;
        }

        .view-switcher {
          display: flex;
          align-items: center;
          gap: 5px;
          width: fit-content;
          max-width: 100%;
          margin-bottom: 27px;
          padding: 4px;
          border: 1px solid #e8e9f2;
          border-radius: 10px;
          background: #eeeff6;
        }

        .view-switcher button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 34px;
          padding: 0 13px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #7b8298;
          font-size: 11px;
          white-space: nowrap;
        }

        .view-switcher button.selected {
          border-color: #e7e8f0;
          background: #fff;
          color: #4b42b8;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(36, 42, 65, 0.04);
        }

        .view-switcher button span {
          display: grid;
          place-items: center;
          min-width: 19px;
          height: 19px;
          padding: 0 4px;
          border-radius: 6px;
          background: #efeff8;
          font-size: 10px;
        }

        .results-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 16px;
        }

        .results-heading h2 {
          margin: 0;
          color: #2d3349;
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -0.3px;
        }

        .results-heading p {
          margin: 5px 0 0;
          color: #9097aa;
          font-size: 11px;
        }

        .sort-label,
        .connector-info {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #8a91a5;
          font-size: 10px;
          white-space: nowrap;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .skill-card {
          min-width: 0;
          min-height: 222px;
          display: flex;
          flex-direction: column;
          padding: 19px;
          border: 1px solid #e6e8f1;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 2px 5px rgba(30, 38, 70, 0.015);
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease;
        }

        .skill-card:hover {
          transform: translateY(-2px);
          border-color: #d5d4f4;
          box-shadow: 0 8px 24px rgba(45, 48, 90, 0.055);
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .skill-icon,
        .connector-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          border: 1px solid #e8e8f4;
          border-radius: 12px;
          background: #f4f3ff;
          color: #6b60df;
        }

        .icon-design {
          background: #fff3f7;
          color: #c15c8b;
          border-color: #f8e5ee;
        }

        .icon-development {
          background: #eef4ff;
          color: #4b78d0;
          border-color: #e1ebff;
        }

        .icon-research {
          background: #eafaf5;
          color: #269b79;
          border-color: #d8f3e9;
        }

        .icon-writing {
          background: #fff5e9;
          color: #bd7d38;
          border-color: #f6eadb;
        }

        .icon-education {
          background: #f0ecff;
          color: #7b60d9;
          border-color: #e5dfff;
        }

        .icon-business {
          background: #eaf7ff;
          color: #3c88b8;
          border-color: #d9effb;
        }

        .icon-marketing {
          background: #fff8df;
          color: #a88820;
          border-color: #f6edc8;
        }

        .icon-productivity {
          background: #edf8ee;
          color: #4b9754;
          border-color: #dff0e0;
        }

        .card-menu {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .added-badge,
        .connected-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 7px;
          border: 1px solid #d8f1e5;
          border-radius: 6px;
          background: #eefaf4;
          color: #27815d;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .danger-icon:hover {
          color: #d34d57;
          background: #fff2f2;
        }

        .skill-card-content {
          flex: 1;
          padding-top: 16px;
        }

        .skill-card h3,
        .connector-card h3 {
          margin: 0;
          color: #30364c;
          font-size: 14px;
          font-weight: 750;
          letter-spacing: -0.15px;
          overflow-wrap: anywhere;
        }

        .skill-description {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          margin: 7px 0 14px;
          color: #858ca0;
          font-size: 11px;
          line-height: 1.75;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 13px;
          border-top: 1px solid #f0f1f6;
        }

        .publisher {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #9298a9;
          font-size: 10px;
        }

        .publisher-dot {
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          border-radius: 6px;
          background: #efefff;
          color: #7266e7;
        }

        .card-buttons {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .try-button,
        .add-button,
        .added-button {
          min-height: 31px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 10px;
          border: 1px solid #e5e7f0;
          border-radius: 8px;
          background: #fff;
          color: #636b83;
          font-size: 10px;
          font-weight: 650;
          transition:
            background 150ms ease,
            border-color 150ms ease;
        }

        .try-button:hover {
          border-color: #c9c4ff;
          background: #f6f5ff;
          color: #5d51d9;
        }

        .add-button {
          border-color: #dcd8ff;
          background: #f5f4ff;
          color: #6054d6;
        }

        .add-button:hover {
          border-color: #bdb5ff;
          background: #ebe9ff;
        }

        .added-button {
          border-color: #d4eee2;
          background: #effaf5;
          color: #28815e;
        }

        .added-button:hover {
          background: #e2f7ed;
        }

        .connector-grid {
          align-items: stretch;
        }

        .connector-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 202px;
          padding: 19px;
          border: 1px solid #e6e8f1;
          border-radius: 14px;
          background: #fff;
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease;
        }

        .connector-card:hover {
          transform: translateY(-2px);
          border-color: #d5d4f4;
          box-shadow: 0 8px 24px rgba(45, 48, 90, 0.055);
        }

        .connector-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 17px;
        }

        .connector-icon {
          background: #f2f3ff;
        }

        .connector-card > p {
          flex: 1;
          margin: 8px 0 18px;
          color: #858ca0;
          font-size: 11px;
          line-height: 1.75;
        }

        .connector-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 13px;
          border-top: 1px solid #f0f1f6;
        }

        .connector-footer > span {
          color: #9298a9;
          font-size: 10px;
        }

        .connect-button,
        .disconnect-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border: 1px solid #dcd8ff;
          border-radius: 8px;
          background: #f5f4ff;
          color: #6054d6;
          font-size: 10px;
          font-weight: 700;
        }

        .disconnect-button {
          border-color: #e5e7f0;
          background: #fff;
          color: #70788e;
        }

        .integration-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 25px;
          padding: 16px;
          border: 1px solid #e6e8f3;
          border-radius: 12px;
          background: #fff;
        }

        .disclaimer-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #f0efff;
          color: #6558e8;
        }

        .integration-disclaimer strong {
          color: #454c65;
          font-size: 11px;
        }

        .integration-disclaimer p {
          margin: 5px 0 0;
          color: #8a91a4;
          font-size: 10px;
          line-height: 1.7;
        }

        .empty-state {
          display: grid;
          justify-items: center;
          padding: 70px 20px;
          border: 1px dashed #dfe2ee;
          border-radius: 14px;
          background: #fff;
          text-align: center;
        }

        .empty-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          margin-bottom: 14px;
          border-radius: 14px;
          background: #f0efff;
          color: #6558e8;
        }

        .empty-state h3 {
          margin: 0;
          color: #343b54;
          font-size: 14px;
        }

        .empty-state p {
          margin: 7px 0 17px;
          color: #8b92a6;
          font-size: 11px;
          line-height: 1.7;
        }

        .secondary-action,
        .cancel-button {
          padding: 9px 13px;
          border: 1px solid #e3e5ef;
          border-radius: 8px;
          background: #fff;
          color: #626b82;
          font-size: 11px;
          font-weight: 650;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          overflow-y: auto;
          background: rgba(22, 27, 47, 0.38);
          backdrop-filter: blur(4px);
        }

        .skill-modal {
          box-sizing: border-box;
          width: min(440px, 100%);
          padding: 25px;
          border: 1px solid #e7e8f3;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 24px 80px rgba(20, 27, 55, 0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .modal-title-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #f0efff;
          color: #6558e8;
        }

        .skill-modal h2 {
          margin: 20px 0 0;
          color: #262d43;
          font-size: 22px;
          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .modal-description {
          margin: 8px 0 22px;
          color: #878ea2;
          font-size: 11px;
          line-height: 1.7;
        }

        .skill-modal label {
          display: block;
          margin: 15px 0 7px;
          color: #4f566c;
          font-size: 11px;
          font-weight: 700;
        }

        .skill-modal input,
        .skill-modal textarea {
          box-sizing: border-box;
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #e2e5ef;
          border-radius: 9px;
          background: #fff;
          color: #30364c;
          font-size: 12px;
          outline: none;
          resize: vertical;
        }

        .skill-modal input:focus,
        .skill-modal textarea:focus {
          border-color: #a7a0f5;
          box-shadow: 0 0 0 3px rgba(101, 88, 232, 0.08);
        }

        .skill-modal input::placeholder,
        .skill-modal textarea::placeholder {
          color: #a2a8b8;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 24px;
        }

        .primary-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        @media (min-width: 1500px) {
          .skills-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1100px) {
          .workspace-layout {
            grid-template-columns: 210px minmax(0, 1fr);
          }

          .sidebar {
            padding-right: 11px;
            padding-left: 11px;
          }

          .main-panel {
            padding-right: 23px;
            padding-left: 23px;
          }

          .cloud-status {
            display: none;
          }

          .skills-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .card-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .card-buttons {
            width: 100%;
            justify-content: flex-end;
          }
        }

        @media (max-width: 760px) {
          .topbar {
            height: 62px;
            padding: 0 15px;
            grid-template-columns: auto 1fr auto;
            gap: 10px;
          }

          .back-link {
            gap: 0;
          }

          .back-link span,
          .brand-divider,
          .brand-product {
            display: none;
          }

          .brand {
            justify-self: center;
            font-size: 14px;
          }

          .topbar-actions {
            gap: 0;
          }

          .create-button {
            width: 35px;
            height: 35px;
            padding: 0;
            font-size: 0;
          }

          .workspace-layout {
            display: block;
            min-height: calc(100vh - 62px);
          }

          .sidebar {
            display: block;
            padding: 12px 15px;
            border-right: 0;
            border-bottom: 1px solid #e9ebf3;
          }

          .sidebar-label,
          .sidebar-divider,
          .sidebar-bottom,
          .sidebar-note {
            display: none;
          }

          .sidebar > .sidebar-item {
            display: inline-flex;
            width: auto;
            min-height: 36px;
            margin: 0 5px 0 0;
            padding: 0 11px;
            white-space: nowrap;
          }

          .category-item {
            display: none !important;
          }

          .main-panel {
            padding: 25px 16px 45px;
          }

          .page-heading {
            align-items: flex-start;
            gap: 12px;
          }

          .heading-metrics {
            padding: 9px;
          }

          .metric-icon {
            width: 33px;
            height: 33px;
          }

          .heading-metrics strong {
            font-size: 15px;
          }

          .heading-metrics span {
            font-size: 9px;
          }

          .skills-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .skill-card {
            min-height: 200px;
          }

          .card-footer {
            flex-direction: row;
            align-items: center;
          }

          .card-buttons {
            width: auto;
          }
        }

        @media (max-width: 440px) {
          .page-heading {
            flex-direction: column;
          }

          .heading-metrics {
            width: 100%;
            box-sizing: border-box;
          }

          .toolbar {
            align-items: stretch;
          }

          .search-shortcut,
          .filter-button {
            display: none;
          }

          .view-switcher {
            width: 100%;
            box-sizing: border-box;
          }

          .view-switcher button {
            flex: 1;
            justify-content: center;
            padding: 0 8px;
          }

          .sort-label,
          .connector-info {
            display: none;
          }

          .card-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .card-buttons {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </main>
  );
}