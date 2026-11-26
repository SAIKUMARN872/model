
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/logout";

  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isPublicRoute) {
      setAuthenticated(true);
      setChecking(false);
      return;
    }

    const isAuthenticated =
      sessionStorage.getItem("modelnow-demo-authenticated") === "true";

    if (isAuthenticated) {
      setAuthenticated(true);
      setChecking(false);
    } else {
      setAuthenticated(false);
      setChecking(false);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, isPublicRoute]);

  if (checking) return null;

  if (!authenticated) return null;

  return <>{children}</>;
}
