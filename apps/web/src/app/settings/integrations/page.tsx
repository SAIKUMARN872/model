
"use client";

import { useState } from "react";

type Integration = {
  name: string;
  description: string;
  category: string;
  icon: string;
};

const integrations: Integration[] = [
  {
    name: "Google Drive",
    description: "Access documents and files from Google Drive.",
    category: "Productivity",
    icon: "G",
  },
  {
    name: "GitHub",
    description: "Connect repositories and developer workflows.",
    category: "Development",
    icon: "⌘",
  },
  {
    name: "Slack",
    description: "Connect team conversations and workspace content.",
    category: "Communication",
    icon: "#",
  },
  {
    name: "Notion",
    description: "Connect notes, documents, and team knowledge.",
    category: "Productivity",
    icon: "N",
  },
  {
    name: "Microsoft OneDrive",
    description: "Access your files and documents.",
    category: "Productivity",
    icon: "☁",
  },
  {
    name: "Dropbox",
    description: "Connect files stored in Dropbox.",
    category: "Productivity",
    icon: "D",
  },
];

export default function IntegrationsSettingsPage() {
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = integrations.filter((item) =>
    `${item.name} ${item.description} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleConnect(name: string) {
    setSelected(name);
  }

  function confirmConnection() {
    if (!selected) return;

    setNotice(
      `${selected}: demo only. Real account authorization is not connected yet.`
    );
    setSelected(null);
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 pb-12 text-black">
      <header>
        <h1 className="text-3xl font-normal tracking-tight">
          Integrations
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Connect your favorite tools to your ModelNow workspace.
        </p>
      </header>

      <section className="rounded-[22px] border border-[#dedede] p-5">
        <h2 className="text-base font-semibold">Connected apps</h2>
        <p className="mt-1 text-sm text-gray-500">
          Apps authorized to work with ModelNow.
        </p>

        {connected.length === 0 ? (
          <p className="mt-5 text-sm text-gray-500">
            No integrations connected yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-gray-200">
            {connected.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span className="text-sm font-medium">{name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setConnected((items) =>
                      items.filter((item) => item !== name)
                    )
                  }
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available integrations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Discover tools you can connect to your workspace.
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search integrations"
          aria-label="Search integrations"
          className="w-full rounded-full border border-[#dedede] bg-transparent px-5 py-3 text-sm outline-none focus:border-gray-500"
        />

        <div className="rounded-[22px] border border-[#dedede] px-5">
          {filtered.map((item) => {
            const isConnected = connected.includes(item.name);

            return (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dedede] py-5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-lg font-semibold">
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-base font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.category}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isConnected}
                  onClick={() => handleConnect(item.name)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm ${
                    isConnected
                      ? "bg-gray-100 text-gray-500"
                      : "bg-[#f0f0f0] hover:bg-[#e6e6e6]"
                  }`}
                >
                  {isConnected ? "Connected" : "Connect"}
                </button>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No integrations found.
            </p>
          )}
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600"
        >
          {notice}
          <button
            type="button"
            onClick={() => setNotice("")}
            className="underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="integration-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="integration-dialog-title"
              className="text-lg font-semibold"
            >
              Connect {selected}?
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Real sign-in and authorization are not configured yet. This
              demo will add the app to the connected list without accessing
              your external account.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-gray-300 px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmConnection}
                className="rounded-full bg-black px-4 py-2.5 text-sm text-white hover:bg-gray-800"
              >
                Continue demo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
