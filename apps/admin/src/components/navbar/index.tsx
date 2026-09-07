type NavigationItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  items?: NavigationItem[];
};

const defaultNavigationItems: NavigationItem[] = [
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
    label: "Audit",
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
    label: "Settings",
    href: "/settings",
  },
];

export default function Navbar({
  items = defaultNavigationItems,
}: NavbarProps) {
  return (
    <header>
      <nav aria-label="Main navigation">
        <div>
          <a href="/dashboard">
            <strong>ModelNow Admin</strong>
          </a>
        </div>

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
    </header>
  );
}