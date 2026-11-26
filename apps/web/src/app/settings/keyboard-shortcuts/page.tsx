
"use client";

import { useState } from "react";

type Shortcut = {
  id: string;
  label: string;
  keys: string;
  enabled: boolean;
};

const defaultShortcuts: Shortcut[] = [
  { id: "focus", label: "Focus main chat", keys: "Shift + Esc", enabled: true },
  { id: "send", label: "Send message", keys: "Enter", enabled: true },
  { id: "background", label: "Send message in background", keys: "Ctrl + Enter", enabled: true },
  { id: "mode", label: "Select mode", keys: "Ctrl + Shift + M", enabled: true },
  { id: "attach", label: "Attach files and folders", keys: "Ctrl + U", enabled: true },
  { id: "delete", label: "Delete chat", keys: "Ctrl + Shift + Delete", enabled: true },
];

export default function KeyboardShortcutsPage() {
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [editingId, setEditingId] = useState<string | null>(null);

  function toggleShortcut(id: string) {
    setShortcuts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  }

  function updateShortcut(id: string, keys: string) {
    setShortcuts((current) =>
      current.map((item) => (item.id === id ? { ...item, keys } : item))
    );
  }

  function restoreDefaults() {
    setShortcuts(defaultShortcuts.map((item) => ({ ...item })));
    setEditingId(null);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 text-[var(--foreground)]">
      <h1 className="text-2xl font-semibold">Keyboard shortcuts</h1>

      <p className="mt-2 text-sm opacity-70">
        To change a shortcut, select the key combination and then type the new key.
      </p>

      <section className="mt-8 space-y-1">
        {shortcuts.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b border-[var(--border)] py-4"
          >
            <button
              type="button"
              role="switch"
              aria-checked={item.enabled}
              aria-label={`${item.label} shortcut`}
              onClick={() => toggleShortcut(item.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                item.enabled ? "bg-green-600" : "bg-neutral-400"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  item.enabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>

            <span
              className={`min-w-0 flex-1 text-sm ${
                item.enabled ? "" : "opacity-50"
              }`}
            >
              {item.label}
            </span>

            {editingId === item.id ? (
              <input
                autoFocus
                aria-label={`New shortcut for ${item.label}`}
                defaultValue={item.keys}
                onKeyDown={(event) => {
                  event.preventDefault();

                  if (event.key === "Escape") {
                    setEditingId(null);
                    return;
                  }

                  const parts = [];
                  if (event.ctrlKey) parts.push("Ctrl");
                  if (event.altKey) parts.push("Alt");
                  if (event.shiftKey) parts.push("Shift");
                  if (event.metaKey) parts.push("Win");

                  if (
                    !["Control", "Alt", "Shift", "Meta"].includes(event.key)
                  ) {
                    parts.push(
                      event.key === " " ? "Space" : event.key
                    );
                    updateShortcut(item.id, parts.join(" + "));
                    setEditingId(null);
                  }
                }}
                onBlur={() => setEditingId(null)}
                className="w-48 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none"
              />
            ) : (
              <button
                type="button"
                disabled={!item.enabled}
                onClick={() => setEditingId(item.id)}
                className="min-w-36 rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-40"
              >
                {item.keys}
              </button>
            )}
          </div>
        ))}
      </section>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={restoreDefaults}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-black/5"
        >
          Restore defaults
        </button>
      </div>
    </main>
  );
}
