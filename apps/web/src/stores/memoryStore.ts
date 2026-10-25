import { create } from "zustand";

interface MemoryStore {
  memories: string[];
  addMemory: (memory: string) => void;
  clearMemory: () => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  memories: [],

  addMemory: (memory) =>
    set((state) => ({
      memories: [...state.memories, memory],
    })),

  clearMemory: () =>
    set({
      memories: [],
    }),
}));