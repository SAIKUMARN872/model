"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  File,
  FilePlus2,
  FileText,
  HardDrive,
  Layers3,
  Link2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

type Skill = {
  id: string;
  name: string;
  description: string;
  publisher: string;
  category: string;
  enabled: boolean;
  custom?: boolean;
};

type Connector = {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
};

type WorkspaceFile = {
  id: string;
  name: string;
  kind: "file" | "component";
  content: string;
  size: number;
};

type ModalState =
  | { type: "skill"; skill?: Skill }
  | { type: "file" }
  | { type: "component" }
  | null;

const initialSkills: Skill[] = [
  {
    id: "design",
    name: "Design",
    description: "Improve product design, UX writing, design systems, and creative workflows.",
    publisher: "ModelNow",
    category: "Design",
    enabled: false,
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Support software architecture, debugging, code review, and development.",
    publisher: "ModelNow",
    category: "Development",
    enabled: false,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Work with design files, reusable components, and product design workflows.",
    publisher: "Figma",
    category: "Design",
    enabled: false,
  },
  {
    id: "seo",
    name: "SearchFit SEO",
    description: "Audit websites, plan content, and improve search visibility.",
    publisher: "SearchFit.ai",
    category: "Marketing",
    enabled: false,
  },
  {
    id: "desktop-commander",
    name: "Desktop Commander",
    description: "Assist with terminal commands, file operations, and desktop workflows.",
    publisher: "ModelNow",
    category: "Productivity",
    enabled: false,
  },
  {
    id: "research",
    name: "Research Assistant",
    description: "Research topics, organize findings, and prepare clear reports.",
    publisher: "ModelNow",
    category: "Research",
    enabled: true,
  },
  {
    id: "writing",
    name: "Writing Assistant",
    description: "Draft and improve emails, reports, documents, and other content.",
    publisher: "ModelNow",
    category: "Writing",
    enabled: false,
  },
  {
    id: "code-review",
    name: "Code Reviewer",
    description: "Review code for bugs, readability, maintainability, and improvements.",
    publisher: "ModelNow",
    category: "Development",
    enabled: true,
  },
  {
    id: "corbis",
    name: "Corbis",
    description: "Find source-grounded information and turn findings into useful summaries.",
    publisher: "ModelNow",
    category: "Research",
    enabled: false,
  },
  {
    id: "finance-tutor",
    name: "Finance Tutor",
    description: "Learn financial concepts through accessible educational explanations.",
    publisher: "ModelNow",
    category: "Education",
    enabled: false,
  },
  {
    id: "partner-managers",
    name: "EULER for Partner Managers",
    description: "Support partner relationships, account workflows, and customer coordination.",
    publisher: "ModelNow",
    category: "Business",
    enabled: false,
  },
  {
    id: "learning",
    name: "Learn",
    description: "Understand unfamiliar topics through explanations and guided learning.",
    publisher: "ModelNow",
    category: "Education",
    enabled: false,
  },
  {
    id: "doc-coauthoring",
    name: "Doc Coauthoring",
    description: "Plan, write, and improve documents through collaborative workflows.",
    publisher: "ModelNow",
    category: "Writing",
    enabled: false,
  },
  {
    id: "web-artifacts",
    name: "Web Artifacts Builder",
    description: "Create interactive web experiences, components, and prototypes.",
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
    enabled: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Organize documents and workspace files.",
    category: "Files",
    enabled: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Bring team conversations into your workflows.",
    category: "Communication",
    enabled: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect notes, documents, and knowledge workspace content.",
    category: "Knowledge",
    enabled: false,
  },
  {
    id: "web",
    name: "Web Search",
    description: "Search the web for research and current information.",
    category: "Research",
    enabled: false,
  },
  {
    id: "files",
    name: "File Workspace",
    description: "Organize files and prepare information for workflows.",
    category: "Files",
    enabled: false,
  },
];

const categories = [
  "Productivity",
  "Development",
  "Design",
  "Research",
  "Writing",
  "Marketing",
  "Business",
  "Education",
  "Other",
];

export default function CustomisePage() {
  const router = useRouter();
  const uploadRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"skills" | "connectors">("skills");
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [connectors, setConnectors] =
    useState<Connector[]>(initialConnectors);
  const [query, setQuery] = useState("");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [notice, setNotice] = useState("");

  const filteredSkills = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return skills;

    return skills.filter((skill) =>
      [
        skill.name,
        skill.description,
        skill.publisher,
        skill.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [skills, query]);

  const filteredConnectors = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return connectors;

    return connectors.filter((connector) =>
      [
        connector.name,
        connector.description,
        connector.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [connectors, query]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function toggleSkill(id: string) {
    setSkills((current) =>
      current.map((skill) =>
        skill.id === id
          ? { ...skill, enabled: !skill.enabled }
          : skill
      )
    );
  }

  function toggleConnector(id: string) {
    setConnectors((current) =>
      current.map((connector) =>
        connector.id === id
          ? { ...connector, enabled: !connector.enabled }
          : connector
      )
    );
  }

  function saveSkill(data: {
    name: string;
    description: string;
    category: string;
    id?: string;
  }) {
    const name = data.name.trim();
    const description = data.description.trim();

    if (!name || !description) {
      showNotice("Enter a name and description.");
      return;
    }

    if (data.id) {
      setSkills((current) =>
        current.map((skill) =>
          skill.id === data.id
            ? {
                ...skill,
                name,
                description,
                category: data.category,
              }
            : skill
        )
      );
      showNotice("Skill updated.");
    } else {
      const newSkill: Skill = {
        id: `custom-${Date.now()}`,
        name,
        description,
        publisher: "My workspace",
        category: data.category,
        enabled: false,
        custom: true,
      };

      setSkills((current) => [newSkill, ...current]);
      showNotice("Skill created.");
    }

    setModal(null);
  }

  function deleteSkill(skill: Skill) {
    if (!skill.custom) {
      showNotice("Built-in skills cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete "${skill.name}"?`)) return;

    setSkills((current) =>
      current.filter((item) => item.id !== skill.id)
    );

    showNotice("Skill deleted.");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const additions: WorkspaceFile[] = files.map((file) => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      name: file.name,
      kind: "file",
      content: "",
      size: file.size,
    }));

    setWorkspaceFiles((current) => [...additions, ...current]);

    showNotice(
      `${files.length} file${files.length === 1 ? "" : "s"} added to this page.`
    );

    event.target.value = "";
    setAddMenuOpen(false);
  }

  function downloadFile(file: WorkspaceFile) {
    const blob = new Blob([file.content], {
      type:
        file.kind === "component"
          ? "text/typescript;charset=utf-8"
          : "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function removeWorkspaceFile(id: string) {
    setWorkspaceFiles((current) =>
      current.filter((file) => file.id !== id)
    );
    showNotice("Item removed from the workspace list.");
  }

  function createWorkspaceItem(
    kind: "file" | "component",
    name: string,
    content: string
  ) {
    const safeName = name.trim();

    if (!safeName) {
      showNotice("Enter a file name.");
      return;
    }

    const finalName =
      kind === "component"
        ? safeName.endsWith(".tsx")
          ? safeName
          : `${safeName}.tsx`
        : safeName;

    const newFile: WorkspaceFile = {
      id: `${kind}-${Date.now()}`,
      name: finalName,
      kind,
      content,
      size: new Blob([content]).size,
    };

    setWorkspaceFiles((current) => [newFile, ...current]);
    setModal(null);

    showNotice(
      `${kind === "component" ? "Component" : "File"} created.`
    );
  }

  return (
    <main className="customise-page">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => router.push("/")}
          aria-label="ModelNow home"
          type="button"
        >
          <span className="brand-mark">
            <Sparkles size={19} />
          </span>
          <span>ModelNow</span>
        </button>

        <button
          className="back-button"
          onClick={() => router.push("/")}
          type="button"
        >
          <ArrowLeft size={16} />
          Back to chat
        </button>
      </header>

      <section className="main-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <Zap size={14} />
              PERSONALIZE YOUR WORKSPACE
            </div>
            <h1>Customize</h1>
            <p>
              Choose the skills and tools that work with your AI workspace.
            </p>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Customize">
          <button
            role="tab"
            aria-selected={activeTab === "skills"}
            className={activeTab === "skills" ? "tab active" : "tab"}
            onClick={() => {
              setActiveTab("skills");
              setQuery("");
            }}
            type="button"
          >
            <Sparkles size={17} />
            Skills
            <span className="tab-count">{skills.length}</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "connectors"}
            className={
              activeTab === "connectors" ? "tab active" : "tab"
            }
            onClick={() => {
              setActiveTab("connectors");
              setQuery("");
            }}
            type="button"
          >
            <Link2 size={17} />
            Connectors
            <span className="tab-count">{connectors.length}</span>
          </button>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                activeTab === "skills"
                  ? "Search skills..."
                  : "Search connectors..."
              }
              aria-label={
                activeTab === "skills"
                  ? "Search skills"
                  : "Search connectors"
              }
            />

            {query && (
              <button
                className="clear-search"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                type="button"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {activeTab === "skills" && (
            <div className="add-menu-wrap">
              <button
                className="primary-button"
                onClick={() => setAddMenuOpen((open) => !open)}
                aria-expanded={addMenuOpen}
                type="button"
              >
                <Plus size={17} />
                Add
                <ChevronDown size={15} />
              </button>

              {addMenuOpen && (
                <div className="add-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setAddMenuOpen(false);
                      uploadRef.current?.click();
                    }}
                  >
                    <span className="menu-icon">
                      <Upload size={17} />
                    </span>
                    <span>
                      <strong>Upload files</strong>
                      <small>Add files to your workspace</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddMenuOpen(false);
                      setModal({ type: "file" });
                    }}
                  >
                    <span className="menu-icon">
                      <FilePlus2 size={17} />
                    </span>
                    <span>
                      <strong>Create file</strong>
                      <small>Create a downloadable text file</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddMenuOpen(false);
                      setModal({ type: "component" });
                    }}
                  >
                    <span className="menu-icon">
                      <Code2 size={17} />
                    </span>
                    <span>
                      <strong>Create component</strong>
                      <small>Create a React component template</small>
                    </span>
                  </button>

                  <div className="menu-divider" />

                  <button
                    type="button"
                    onClick={() => {
                      setAddMenuOpen(false);
                      setModal({ type: "skill" });
                    }}
                  >
                    <span className="menu-icon">
                      <Sparkles size={17} />
                    </span>
                    <span>
                      <strong>Create skill</strong>
                      <small>Add a custom AI skill</small>
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab === "skills" ? (
          <>
            <div className="section-heading">
              <div>
                <h2>Available skills</h2>
                <p>Add skills to your workspace or edit your own.</p>
              </div>
              <span className="result-count">
                {filteredSkills.length}{" "}
                {filteredSkills.length === 1 ? "skill" : "skills"}
              </span>
            </div>

            {filteredSkills.length > 0 ? (
              <div className="card-grid">
                {filteredSkills.map((skill) => (
                  <article className="item-card" key={skill.id}>
                    <div className="card-top">
                      <div className="item-icon skill-icon">
                        <Sparkles size={21} />
                      </div>

                      <button
                        className="icon-button"
                        aria-label={`Edit ${skill.name}`}
                        onClick={() => setModal({ type: "skill", skill })}
                        title="Edit skill"
                        type="button"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>

                    <div className="item-title-row">
                      <h3>{skill.name}</h3>
                      {skill.custom && (
                        <span className="custom-badge">Custom</span>
                      )}
                    </div>

                    <p className="item-description">{skill.description}</p>

                    <div className="card-meta">
                      <span>{skill.publisher}</span>
                      <span className="meta-dot" />
                      <span>{skill.category}</span>
                    </div>

                    <div className="card-footer">
                      <button
                        className="try-button"
                        onClick={() =>
                          router.push(
                            `/chat?skill=${encodeURIComponent(skill.name)}`
                          )
                        }
                        type="button"
                      >
                        Try
                        <ArrowRight size={15} />
                      </button>

                      <div className="card-actions">
                        {skill.custom && (
                          <button
                            className="delete-button"
                            onClick={() => deleteSkill(skill)}
                            title="Delete skill"
                            aria-label={`Delete ${skill.name}`}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        <button
                          className={
                            skill.enabled
                              ? "added-button"
                              : "add-outline-button"
                          }
                          onClick={() => toggleSkill(skill.id)}
                          type="button"
                        >
                          {skill.enabled ? (
                            <>
                              <Check size={15} />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus size={15} />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No skills found"
                description="Try a different search or create a new skill."
                onAction={() => {
                  setQuery("");
                  setModal({ type: "skill" });
                }}
                actionLabel="Create skill"
              />
            )}
          </>
        ) : (
          <>
            <div className="section-heading">
              <div>
                <h2>Available connectors</h2>
                <p>Connect external services to extend your workspace.</p>
              </div>
              <span className="result-count">
                {filteredConnectors.length}{" "}
                {filteredConnectors.length === 1
                  ? "connector"
                  : "connectors"}
              </span>
            </div>

            {filteredConnectors.length > 0 ? (
              <div className="card-grid">
                {filteredConnectors.map((connector) => (
                  <article className="item-card" key={connector.id}>
                    <div className="card-top">
                      <div className="item-icon connector-icon">
                        {connector.id === "github" ? (
                          <Code2 size={22} />
                        ) : connector.id === "google-drive" ? (
                          <HardDrive size={22} />
                        ) : connector.id === "files" ? (
                          <FileText size={22} />
                        ) : connector.id === "web" ? (
                          <Search size={22} />
                        ) : (
                          <Link2 size={22} />
                        )}
                      </div>

                      {connector.enabled && (
                        <span className="connected-badge">
                          <span />
                          Enabled
                        </span>
                      )}
                    </div>

                    <h3>{connector.name}</h3>
                    <p className="item-description">
                      {connector.description}
                    </p>

                    <div className="card-meta">
                      <span>{connector.category}</span>
                    </div>

                    <div className="card-footer connector-footer">
                      <span className="connection-label">
                        {connector.enabled ? "Enabled" : "Not connected"}
                      </span>

                      <button
                        className={
                          connector.enabled
                            ? "added-button"
                            : "add-outline-button"
                        }
                        onClick={() => {
                          toggleConnector(connector.id);
                          showNotice(
                            connector.enabled
                              ? `${connector.name} disabled in this preview.`
                              : `${connector.name} enabled in this preview.`
                          );
                        }}
                        type="button"
                      >
                        {connector.enabled ? (
                          <>
                            <Check size={15} />
                            Enabled
                          </>
                        ) : (
                          <>
                            <Plus size={15} />
                            Connect
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No connectors found"
                description="Try searching for another connector."
                onAction={() => setQuery("")}
                actionLabel="Clear search"
              />
            )}
          </>
        )}

        {workspaceFiles.length > 0 && (
          <section className="workspace-section">
            <div className="section-heading">
              <div>
                <h2>Workspace files</h2>
                <p>Files and templates added during this session.</p>
              </div>
              <span className="result-count">
                {workspaceFiles.length} items
              </span>
            </div>

            <div className="workspace-list">
              {workspaceFiles.map((file) => (
                <div className="workspace-file" key={file.id}>
                  <div className="workspace-file-icon">
                    {file.kind === "component" ? (
                      <Code2 size={19} />
                    ) : (
                      <File size={19} />
                    )}
                  </div>

                  <div className="workspace-file-info">
                    <strong>{file.name}</strong>
                    <span>
                      {file.kind === "component"
                        ? "React component"
                        : "Workspace file"}
                      {file.size > 0 && ` · ${formatBytes(file.size)}`}
                    </span>
                  </div>

                  {file.content && (
                    <button
                      className="icon-button"
                      onClick={() => downloadFile(file)}
                      title="Download"
                      aria-label={`Download ${file.name}`}
                      type="button"
                    >
                      <ArrowDownToLine size={17} />
                    </button>
                  )}

                  <button
                    className="icon-button"
                    onClick={() => removeWorkspaceFile(file.id)}
                    title="Remove from list"
                    aria-label={`Remove ${file.name}`}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>

      <input
        ref={uploadRef}
        type="file"
        multiple
        hidden
        onChange={handleUpload}
      />

      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}

      {modal?.type === "skill" && (
        <SkillModal
          skill={modal.skill}
          onClose={() => setModal(null)}
          onSave={saveSkill}
        />
      )}

      {modal?.type === "file" && (
        <WorkspaceModal
          type="file"
          onClose={() => setModal(null)}
          onCreate={(name, content) =>
            createWorkspaceItem("file", name, content)
          }
        />
      )}

      {modal?.type === "component" && (
        <WorkspaceModal
          type="component"
          onClose={() => setModal(null)}
          onCreate={(name, content) =>
            createWorkspaceItem("component", name, content)
          }
        />
      )}

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
          background: #fbfaff;
          color: #211d32;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .customise-page {
          min-height: 100vh;
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(123, 97, 255, 0.055),
              transparent 45%
            ),
            #fbfaff;
        }

        .topbar {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5.5%;
          border-bottom: 1px solid #ece9f5;
          background: rgba(255, 255, 255, 0.88);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 0;
          background: transparent;
          color: #241b45;
          font-size: 19px;
          font-weight: 750;
          letter-spacing: -0.7px;
        }

        .brand-mark {
          display: grid;
          place-items: center;
          width: 33px;
          height: 33px;
          border-radius: 11px;
          background: #6e56cf;
          color: white;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border: 1px solid #e7e3f0;
          border-radius: 10px;
          background: white;
          color: #5b566b;
          font-size: 13px;
          font-weight: 600;
        }

        .back-button:hover,
        .icon-button:hover {
          background: #f5f2ff;
          color: #6749d5;
        }

        .main-content {
          max-width: 1220px;
          width: calc(100% - 48px);
          margin: 0 auto;
          padding: 46px 0 80px;
        }

        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 29px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 13px;
          color: #7458d7;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .page-heading h1 {
          margin: 0;
          color: #211b37;
          font-size: clamp(30px, 4vw, 39px);
          font-weight: 750;
          letter-spacing: -1.5px;
        }

        .page-heading p {
          margin: 10px 0 0;
          color: #777187;
          font-size: 14px;
          line-height: 1.6;
        }

        .tabs {
          display: flex;
          gap: 25px;
          border-bottom: 1px solid #e8e4f0;
        }

        .tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 15px 3px 17px;
          border: 0;
          background: transparent;
          color: #827c91;
          font-size: 14px;
          font-weight: 650;
        }

        .tab.active {
          color: #6447d0;
        }

        .tab.active::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          border-radius: 5px 5px 0 0;
          background: #7658df;
          content: "";
        }

        .tab-count {
          display: grid;
          min-width: 22px;
          height: 22px;
          place-items: center;
          padding: 0 6px;
          border-radius: 7px;
          background: #f0edfa;
          color: #71668f;
          font-size: 11px;
          font-weight: 700;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 25px 0 32px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          max-width: 470px;
          height: 44px;
          padding: 0 13px;
          border: 1px solid #e5e1ef;
          border-radius: 11px;
          background: white;
          color: #9189a3;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .search-box:focus-within {
          border-color: #a695ee;
          box-shadow: 0 0 0 3px rgba(116, 88, 215, 0.09);
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #29233c;
          font-size: 13px;
        }

        .search-box input::placeholder {
          color: #a39caf;
        }

        .clear-search {
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #8d869f;
        }

        .add-menu-wrap {
          position: relative;
          margin-left: auto;
        }

        .primary-button {
          display: inline-flex;
          height: 44px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 15px;
          border: 1px solid #6b50d0;
          border-radius: 11px;
          background: #7055d7;
          color: white;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 3px 8px rgba(95, 67, 193, 0.14);
        }

        .primary-button:hover {
          background: #6045c5;
        }

        .add-menu {
          position: absolute;
          z-index: 20;
          top: 52px;
          right: 0;
          width: 280px;
          padding: 7px;
          border: 1px solid #e9e5f2;
          border-radius: 14px;
          background: white;
          box-shadow: 0 16px 42px rgba(41, 30, 80, 0.13);
        }

        .add-menu > button {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 11px;
          padding: 11px 9px;
          border: 0;
          border-radius: 9px;
          background: white;
          text-align: left;
        }

        .add-menu > button:hover {
          background: #f8f6ff;
        }

        .menu-icon {
          display: grid;
          flex: 0 0 36px;
          height: 36px;
          place-items: center;
          border: 1px solid #eae5fc;
          border-radius: 10px;
          background: #f4f0ff;
          color: #7357d5;
        }

        .add-menu strong,
        .add-menu small {
          display: block;
        }

        .add-menu strong {
          color: #302844;
          font-size: 12px;
          font-weight: 700;
        }

        .add-menu small {
          margin-top: 4px;
          color: #91899e;
          font-size: 11px;
          line-height: 1.4;
        }

        .menu-divider {
          height: 1px;
          margin: 5px 7px;
          background: #efedf5;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 17px;
        }

        .section-heading h2 {
          margin: 0;
          color: #2c2540;
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -0.35px;
        }

        .section-heading p {
          margin: 6px 0 0;
          color: #8a8399;
          font-size: 12px;
          line-height: 1.5;
        }

        .result-count {
          flex-shrink: 0;
          color: #8a8399;
          font-size: 11px;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .item-card {
          display: flex;
          min-width: 0;
          min-height: 242px;
          flex-direction: column;
          padding: 20px;
          border: 1px solid #eae6f2;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.94);
          transition: transform 0.17s ease, border-color 0.17s ease,
            box-shadow 0.17s ease;
        }

        .item-card:hover {
          transform: translateY(-2px);
          border-color: #d8cff7;
          box-shadow: 0 10px 25px rgba(51, 34, 104, 0.055);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .item-icon {
          display: grid;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e9e3ff;
          border-radius: 13px;
          background: #f4f0ff;
          color: #7356d7;
        }

        .connector-icon {
          border-color: #e9e5f1;
          background: #f8f7fb;
          color: #665b83;
        }

        .icon-button {
          display: grid;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 9px;
          background: transparent;
          color: #8d859f;
        }

        .item-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .item-card h3 {
          margin: 0;
          color: #2b253c;
          font-size: 14px;
          font-weight: 750;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .custom-badge {
          padding: 3px 7px;
          border-radius: 5px;
          background: #f0ebff;
          color: #6e52ce;
          font-size: 9px;
          font-weight: 750;
        }

        .item-description {
          margin: 9px 0 16px;
          color: #80798f;
          font-size: 12px;
          line-height: 1.7;
        }

        .card-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: auto;
          padding-top: 2px;
          color: #9b94a9;
          font-size: 10px;
        }

        .meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #b6afc6;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 17px;
          padding-top: 13px;
          border-top: 1px solid #f0edf5;
        }

        .try-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 0;
          border: 0;
          background: transparent;
          color: #7054d2;
          font-size: 12px;
          font-weight: 750;
        }

        .try-button:hover {
          color: #4e35b4;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .delete-button {
          display: grid;
          width: 30px;
          height: 32px;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #a29aac;
        }

        .delete-button:hover {
          background: #fff0f1;
          color: #d24b5a;
        }

        .add-outline-button,
        .added-button {
          display: inline-flex;
          min-height: 33px;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 11px;
          border: 1px solid #ded6fa;
          border-radius: 9px;
          background: white;
          color: #6b50cb;
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
        }

        .add-outline-button:hover {
          border-color: #8b73e0;
          background: #f8f5ff;
        }

        .added-button {
          border-color: #e3dcfb;
          background: #f4f0ff;
          color: #6a4ec8;
        }

        .connected-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #5d9b77;
          font-size: 10px;
          font-weight: 700;
        }

        .connected-badge span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #62b887;
        }

        .connection-label {
          color: #9a93a7;
          font-size: 11px;
        }

        .connector-footer {
          margin-top: auto;
        }

        .workspace-section {
          margin-top: 42px;
        }

        .workspace-list {
          overflow: hidden;
          border: 1px solid #eae6f2;
          border-radius: 14px;
          background: white;
        }

        .workspace-file {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          border-bottom: 1px solid #f0edf5;
        }

        .workspace-file:last-child {
          border-bottom: 0;
        }

        .workspace-file-icon {
          display: grid;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 10px;
          background: #f3efff;
          color: #7155d5;
        }

        .workspace-file-info {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
          gap: 4px;
        }

        .workspace-file-info strong {
          overflow: hidden;
          color: #302942;
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .workspace-file-info span {
          color: #9891a6;
          font-size: 10px;
        }

        .toast {
          position: fixed;
          z-index: 100;
          right: 24px;
          bottom: 24px;
          display: flex;
          max-width: calc(100vw - 32px);
          align-items: center;
          gap: 9px;
          padding: 13px 17px;
          border: 1px solid #e5dff7;
          border-radius: 12px;
          background: white;
          color: #4c3c80;
          box-shadow: 0 12px 35px rgba(40, 28, 81, 0.14);
          font-size: 12px;
        }

        @media (max-width: 950px) {
          .card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .topbar {
            height: 62px;
            padding: 0 17px;
          }

          .brand {
            font-size: 17px;
          }

          .back-button {
            gap: 5px;
            padding: 8px;
            font-size: 11px;
          }

          .main-content {
            width: calc(100% - 32px);
            padding-top: 32px;
          }

          .page-heading {
            margin-bottom: 22px;
          }

          .page-heading p {
            max-width: 330px;
            font-size: 12px;
          }

          .tabs {
            gap: 22px;
          }

          .toolbar {
            align-items: stretch;
            gap: 8px;
            margin: 20px 0 27px;
          }

          .search-box {
            min-width: 0;
            height: 42px;
            padding: 0 10px;
          }

          .primary-button {
            height: 42px;
            gap: 5px;
            padding: 0 10px;
          }

          .add-menu {
            width: min(280px, calc(100vw - 32px));
          }

          .card-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }

          .item-card {
            min-height: 225px;
            padding: 17px;
          }

          .section-heading h2 {
            font-size: 15px;
          }

          .section-heading p {
            max-width: 270px;
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}

function EmptyState({
  title,
  description,
  onAction,
  actionLabel,
}: {
  title: string;
  description: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Search size={21} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button onClick={onAction} type="button">
        {actionLabel}
      </button>

      <style jsx>{`
        .empty-state {
          display: flex;
          min-height: 240px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 16px;
          border: 1px dashed #ded8ee;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.7);
          text-align: center;
        }

        .empty-icon {
          display: grid;
          width: 44px;
          height: 44px;
          place-items: center;
          border-radius: 13px;
          background: #f1edff;
          color: #7659d7;
        }

        h3 {
          margin: 14px 0 5px;
          color: #302844;
          font-size: 14px;
        }

        p {
          margin: 0;
          color: #898197;
          font-size: 12px;
          line-height: 1.6;
        }

        button {
          margin-top: 15px;
          padding: 9px 13px;
          border: 1px solid #ddd4fa;
          border-radius: 9px;
          background: white;
          color: #6e52cf;
          font-size: 11px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

function SkillModal({
  skill,
  onClose,
  onSave,
}: {
  skill?: Skill;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    category: string;
    id?: string;
  }) => void;
}) {
  const [name, setName] = useState(skill?.name ?? "");
  const [description, setDescription] = useState(
    skill?.description ?? ""
  );
  const [category, setCategory] = useState(
    skill?.category ?? "Productivity"
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      id: skill?.id,
      name,
      description,
      category,
    });
  }

  return (
    <ModalShell
      title={skill ? "Edit skill" : "Create skill"}
      description={
        skill
          ? "Update the details of this skill."
          : "Create a reusable skill for your workspace."
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <label>
          Skill name
          <input
            autoFocus
            required
            maxLength={70}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Product Research"
          />
        </label>

        <label>
          Description
          <textarea
            required
            maxLength={300}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what this skill should help with."
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="save-button">
            <Check size={16} />
            {skill ? "Save changes" : "Create skill"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #514963;
          font-size: 12px;
          font-weight: 700;
        }

        input,
        textarea,
        select {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #e4dfed;
          border-radius: 9px;
          outline: none;
          background: white;
          color: #302942;
          font-size: 12px;
          font-weight: 400;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: #927de4;
          box-shadow: 0 0 0 3px rgba(112, 85, 215, 0.09);
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding-top: 5px;
        }

        .modal-actions button {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 13px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
        }

        .secondary-button {
          border: 1px solid #e4dfed;
          background: white;
          color: #686075;
        }

        .save-button {
          border: 1px solid #6c50d0;
          background: #7055d7;
          color: white;
        }
      `}</style>
    </ModalShell>
  );
}

function WorkspaceModal({
  type,
  onClose,
  onCreate,
}: {
  type: "file" | "component";
  onClose: () => void;
  onCreate: (name: string, content: string) => void;
}) {
  const isComponent = type === "component";

  const [name, setName] = useState(
    isComponent ? "MyComponent" : "notes.txt"
  );

  const [content, setContent] = useState(
    isComponent
      ? `export default function MyComponent() {
  return (
    <div>
      <h1>My component</h1>
      <p>Start building your interface here.</p>
    </div>
  );
}`
      : ""
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate(name, content);
  }

  return (
    <ModalShell
      title={isComponent ? "Create component" : "Create file"}
      description={
        isComponent
          ? "Create a React component template that you can download."
          : "Create a text file and add your content."
      }
      onClose={onClose}
    >
      <form className="workspace-form" onSubmit={handleSubmit}>
        <label>
          {isComponent ? "Component name" : "File name"}
          <input
            autoFocus
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={isComponent ? "MyComponent" : "notes.txt"}
          />
        </label>

        <label>
          Content
          <textarea
            rows={isComponent ? 10 : 7}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              isComponent
                ? "Write your React component..."
                : "Start writing your file..."
            }
          />
        </label>

        {isComponent && (
          <p className="template-note">
            A .tsx React component template is provided to help you get started.
          </p>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="save-button">
            <Plus size={16} />
            Create
          </button>
        </div>
      </form>

      <style jsx>{`
        .workspace-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #514963;
          font-size: 12px;
          font-weight: 700;
        }

        input,
        textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #e4dfed;
          border-radius: 9px;
          outline: none;
          background: white;
          color: #302942;
          font-family: ${isComponent
            ? "ui-monospace, SFMono-Regular, Menlo, monospace"
            : "inherit"};
          font-size: 12px;
          font-weight: 400;
          line-height: 1.65;
        }

        input:focus,
        textarea:focus {
          border-color: #927de4;
          box-shadow: 0 0 0 3px rgba(112, 85, 215, 0.09);
        }

        textarea {
          resize: vertical;
        }

        .template-note {
          margin: -4px 0 0;
          color: #8d849d;
          font-size: 11px;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding-top: 4px;
        }

        .modal-actions button {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 13px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
        }

        .secondary-button {
          border: 1px solid #e4dfed;
          background: white;
          color: #686075;
        }

        .save-button {
          border: 1px solid #6c50d0;
          background: #7055d7;
          color: white;
        }
      `}</style>
    </ModalShell>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-header">
          <div className="modal-heading-icon">
            <Layers3 size={20} />
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <X size={19} />
          </button>
        </header>

        <h2>{title}</h2>
        <p className="modal-description">{description}</p>

        {children}
      </section>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          z-index: 90;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 22px;
          background: rgba(27, 20, 48, 0.42);
          backdrop-filter: blur(4px);
        }

        .modal-panel {
          width: 100%;
          max-width: 480px;
          max-height: calc(100vh - 44px);
          overflow-y: auto;
          padding: 25px;
          border: 1px solid #e8e2f4;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 25px 80px rgba(25, 16, 57, 0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .modal-heading-icon {
          display: grid;
          width: 43px;
          height: 43px;
          place-items: center;
          border: 1px solid #e7e0ff;
          border-radius: 12px;
          background: #f3efff;
          color: #7055d7;
        }

        .modal-close {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #898197;
        }

        .modal-close:hover {
          background: #f5f2ff;
          color: #7055d7;
        }

        h2 {
          margin: 0;
          color: #2b243d;
          font-size: 20px;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .modal-description {
          margin: 7px 0 23px;
          color: #898197;
          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width: 500px) {
          .modal-panel {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}