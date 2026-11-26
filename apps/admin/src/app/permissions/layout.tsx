"use client";

import { useState } from "react";
import Sidebar from "../../components/sidebar";
import Navbar from "../../components/navbar";

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-layout">
      {mobileOpen && (
        <button
          type="button"
          className="admin-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
      >
        <Sidebar
          collapsed={collapsed}
          onCollapse={() => setCollapsed((value) => !value)}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="admin-main">
        <Navbar onMobileMenuClick={() => setMobileOpen(true)} />

        <main id="main-content" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}