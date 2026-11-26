import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import "./playground-layout.css";

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: "/chat",
    label: "Chat Playground",
    icon: "◈",
    description: "Test prompts and interact with AI models.",
  },
  {
    path: "/models",
    label: "Model Selection",
    icon: "◇",
    description: "Select and explore available AI models.",
  },
  {
    path: "/compare",
    label: "Model Comparison",
    icon: "⇄",
    description: "Compare responses across different models.",
  },
  {
    path: "/prompts",
    label: "Prompt Testing",
    icon: "✎",
    description: "Create and test prompts.",
  },
  {
    path: "/parameters",
    label: "Parameter Controls",
    icon: "☷",
    description: "Configure model generation parameters.",
  },
  {
    path: "/system-instructions",
    label: "System Instructions",
    icon: "▤",
    description: "Configure system-level instructions.",
  },
  {
    path: "/structured-output",
    label: "Structured Output",
    icon: "{ }",
    description: "Test structured and formatted model responses.",
  },
  {
    path: "/multimodal",
    label: "Multimodal Testing",
    icon: "▧",
    description: "Test image and multimodal model inputs.",
  },
  {
    path: "/web-search",
    label: "Web Search Testing",
    icon: "⌕",
    description: "Test web search capabilities.",
  },
  {
    path: "/file-testing",
    label: "File Testing",
    icon: "▱",
    description: "Test file uploads and document inputs.",
  },
  {
    path: "/routing-playground",
    label: "Routing Playground",
    icon: "⑂",
    description: "Test model routing and provider selection.",
  },
  {
    path: "/cost-estimation",
    label: "Cost Estimation",
    icon: "$",
    description: "Estimate model request costs.",
  },
  {
    path: "/latency",
    label: "Latency Testing",
    icon: "◷",
    description: "Measure model response latency.",
  },
  {
    path: "/api-builder",
    label: "API Request Builder",
    icon: "</>",
    description: "Build and inspect API requests.",
  },
  {
    path: "/code-examples",
    label: "Code Examples",
    icon: "</>",
    description: "Explore integration code examples.",
  },
  {
    path: "/history",
    label: "History",
    icon: "↶",
    description: "Review previous Playground executions.",
  },
  {
    path: "/knowledge-hub",
    label: "Knowledge Hub",
    icon: "▤",
    description: "Manage documents and enterprise knowledge.",
  },
  {
    path: "/fine-tuning",
    label: "Fine-tuning",
    icon: "⚙",
    description: "Customize models using your datasets.",
  },
  {
    path: "/agents",
    label: "Agent",
    icon: "✧",
    description: "Build and test AI agents and workflows.",
  },
];

export default function PlaygroundLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const activePage =
    navigationItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
    ) ?? navigationItems[0];

  // Close profile popup when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Close profile popup whenever the route changes.
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const openSettings = () => {
    setProfileOpen(false);
    navigate("/settings");
  };

  const openLogout = () => {
    setProfileOpen(false);
    navigate("/logout");
  };

  const toggleProfile = () => {
    setProfileOpen((previous) => !previous);
  };

  return (
    <div className="pn-layout">
      {/* Sidebar */}
      <aside className="pn-sidebar">
        {/* Brand */}
        <div className="pn-brand">
          <div className="pn-brand-mark" aria-hidden="true">
            M
          </div>

          <div className="pn-brand-copy">
            <strong>ModelNow</strong>
            <span>PLAYGROUND</span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="pn-navigation"
          aria-label="Playground navigation"
        >
          <span className="pn-section-label">
            PLAYGROUND TOOLS
          </span>

          <div className="pn-navigation-items">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  isActive
                    ? "pn-nav-link pn-nav-link-active"
                    : "pn-nav-link"
                }
              >
                <span
                  className="pn-nav-icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span className="pn-nav-label">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="pn-sidebar-footer">
          <div
            className="pn-profile-wrapper"
            ref={profileRef}
          >
            {profileOpen && (
              <div
                className="pn-profile-popup"
                role="menu"
                aria-label="Account menu"
              >
                <div className="pn-popup-user">
                  <div className="pn-user-avatar-large">
                    P
                  </div>

                  <div className="pn-popup-user-details">
                    <strong>Pujitha</strong>
                    <span>
                      pujithamarikanti@gmail.com
                    </span>
                  </div>
                </div>

                <div className="pn-popup-divider" />

                <button
                  type="button"
                  className="pn-profile-menu-item"
                  role="menuitem"
                  onClick={openSettings}
                >
                  <Settings size={17} />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  className="pn-profile-menu-item pn-logout-item"
                  role="menuitem"
                  onClick={openLogout}
                >
                  <LogOut size={17} />
                  <span>Log out</span>
                </button>
              </div>
            )}

            <button
              type="button"
              className={`pn-profile-trigger ${
                profileOpen
                  ? "pn-profile-trigger-active"
                  : ""
              }`}
              onClick={toggleProfile}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Open account menu"
            >
              <div className="pn-user-avatar">P</div>

              <div className="pn-profile-trigger-details">
                <strong>Pujitha</strong>
                <span>Personal account</span>
              </div>

              <ChevronUp
                size={17}
                className={`pn-profile-chevron ${
                  profileOpen ? "pn-chevron-open" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="pn-main">
        {/* Topbar */}
        <header className="pn-topbar">
          <div
            className="pn-breadcrumb"
            aria-label="Breadcrumb"
          >
            <span>ModelNow</span>

            <span
              className="pn-breadcrumb-separator"
              aria-hidden="true"
            >
              /
            </span>

            <strong>{activePage.label}</strong>
          </div>

          <div className="pn-topbar-right">
            <div className="pn-environment-badge">
              <span aria-hidden="true" />
              DEVELOPMENT
            </div>

            <div
              className="pn-user-avatar"
              aria-label="User profile"
            >
              P
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="pn-content">
          <div className="pn-page-heading">
            <div className="pn-page-heading-copy">
              <span className="pn-eyebrow">
                MODELNOW / DEVELOPER WORKSPACE
              </span>

              <h1>{activePage.label}</h1>

              <p>{activePage.description}</p>
            </div>

            <span className="pn-version-badge">
              Playground
            </span>
          </div>

          <section className="pn-page-container">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}