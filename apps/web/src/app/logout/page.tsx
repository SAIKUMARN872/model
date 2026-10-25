
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleCancel() {
    router.push("/home");
  }

  async function handleLogout() {
    setLoading(true);

    try {
      // Clear the demo authentication state if your app uses it.
      // Replace this with your real logout API when authentication is connected.
      localStorage.removeItem("modelnow-user");
      localStorage.removeItem("modelnow-auth");
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#FCFCFC] px-5 py-12 text-black">
      <section className="w-full max-w-[480px]">
        <h1 className="mb-6 text-center text-3xl font-normal tracking-tight sm:text-4xl">
          Log out of ModelNow?
        </h1>

        <div className="flex items-center gap-4 rounded-[22px] border border-[#E0E0E0] px-4 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#34495E] text-sm font-medium text-white">
            U
          </div>

          <div className="min-w-0">
            <p className="text-base font-semibold">User</p>
            <p className="break-all text-sm text-[#64748B]">
              ModelNow account
            </p>
          </div>
        </div>

        <p className="my-7 text-center text-base leading-6 text-[#64748B]">
          You&apos;ll need to log in again to access your workspace.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0B0B0B] px-5 py-5 text-base font-semibold text-white transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          )}
          {loading ? "Logging out..." : "Log out"}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="mt-4 w-full rounded-full border border-[#DEDEDE] bg-transparent px-5 py-5 text-base font-medium text-black transition hover:bg-[#F5F5F5] disabled:opacity-60"
        >
          Cancel
        </button>
      </section>

      <footer className="mt-auto flex flex-col items-center gap-5 pt-24">
        <Sparkles className="h-6 w-6 text-black" />

        <div className="flex items-center gap-5 text-sm text-[#52657A]">
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-black"
          >
            Terms of Service
          </Link>

          <span className="h-4 w-px bg-[#D8D8D8]" />

          <Link
            href="/privacy-policy"
            className="underline underline-offset-2 hover:text-black"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </main>
  );
}
