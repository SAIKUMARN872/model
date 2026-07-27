export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>ModelNow Admin Portal</title>
        <meta
          name="description"
          content="ModelNow enterprise administration portal"
        />
      </head>

      <body>
        <header>
          <nav>
            <strong>ModelNow Admin</strong>

            <ul>
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>

              <li>
                <a href="/users">Users</a>
              </li>

              <li>
                <a href="/organizations">Organizations</a>
              </li>

              <li>
                <a href="/workspaces">Workspaces</a>
              </li>

              <li>
                <a href="/roles">Roles</a>
              </li>

              <li>
                <a href="/permissions">Permissions</a>
              </li>

              <li>
                <a href="/security">Security</a>
              </li>

              <li>
                <a href="/audit">Audit</a>
              </li>

              <li>
                <a href="/compliance">Compliance</a>
              </li>

              <li>
                <a href="/governance">Governance</a>
              </li>

              <li>
                <a href="/usage">Usage</a>
              </li>

              <li>
                <a href="/settings">Settings</a>
              </li>
            </ul>
          </nav>
        </header>

        <main>{children}</main>

        <footer>
          <p>
            ModelNow Admin Portal
          </p>

          <p>
            Enterprise administration and platform management
          </p>
        </footer>
      </body>
    </html>
  );
}