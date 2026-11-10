import React from "react";

export default function UserPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">User</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View your account information and manage your console preferences.
        </p>
      </header>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-medium">Account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Account details will appear here when the authenticated user profile
          is available from the configured API.
        </p>
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-medium">Quick links</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open Settings to review your console configuration. Account changes
          require a verified backend endpoint and authorization checks.
        </p>
      </section>
    </main>
  );
}