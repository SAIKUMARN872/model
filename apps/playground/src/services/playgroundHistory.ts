
export type PlaygroundHistoryStatus = "success" | "failed";

export interface PlaygroundHistoryEntry {
  id: string;
  feature: string;
  title: string;
  model?: string;
  prompt?: string;
  response?: string;
  status: PlaygroundHistoryStatus;
  duration?: number;
  createdAt: string;
}

const STORAGE_KEY = "modelnow-playground-history-v1";

export function getPlaygroundHistory(): PlaygroundHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePlaygroundHistory(
  entry: Omit<PlaygroundHistoryEntry, "id" | "createdAt"> &
    Partial<Pick<PlaygroundHistoryEntry, "id" | "createdAt">>
): PlaygroundHistoryEntry {
  const newEntry: PlaygroundHistoryEntry = {
    ...entry,
    id: entry.id || crypto.randomUUID(),
    createdAt: entry.createdAt || new Date().toISOString(),
  };

  const history = getPlaygroundHistory();
  history.unshift(newEntry);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  return newEntry;
}

export function deletePlaygroundHistory(id: string): void {
  const updated = getPlaygroundHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearPlaygroundHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
