type SidebarItem = {
  label: string;
  href: string;
};

type SidebarProps = {
  items?: SidebarItem[];
};

const defaultSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Users",
    href: "/users",
  },
  {
    label: "Organizations",
    href: "/organizations",
  },
  {
    label: "Workspaces",
    href: "/workspaces",
  },
  {
    label: "Roles",
    href: "/roles",
  },
  {
    label: "Permissions",
    href: "/permissions",
  },
  {
    label: "Security",
    href: "/security",
  },
  {
    label: "Audit Logs",
    href: "/audit",
  },
  {
    label: "Compliance",
    href: "/compliance",
  },
  {
    label: "Governance",
    href: "/governance",
  },
  {
    label: "Usage",
    href: "/usage",
  },
  {
    label: "Billing",
    href: "/billing",
  },
  {
    label: "Settings",
    href: "/settings",
  },
];

export default function Sidebar({
  items = defaultSidebarItems,
}: SidebarProps) {
  return (
    <aside>
      <header>
        <a href="/dashboard">
          <strong>ModelNow Admin</strong>
        </a>

        <p>Enterprise Administration</p>
      </header>

      <nav aria-label="Sidebar navigation">
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <footer>
        <p>ModelNow Platform</p>

        <a href="/settings">
          Administration Settings
        </a>
      </footer>
    </aside>
  );
}