
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ObservabilityContent() {
  const router = useRouter();

  useEffect(() => {
router.replace("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <p className="text-sm text-slate-400">
        Opening ModelNow Observability...
      </p>
    </main>
  );
}
