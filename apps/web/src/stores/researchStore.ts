import { create } from "zustand";

interface ResearchStore {
  query: string;
  result: string;

  setQuery: (query: string) => void;
  setResult: (result: string) => void;
}

export const useResearchStore = create<ResearchStore>((set) => ({
  query: "",
  result: "",

  setQuery: (query) =>
    set({
      query,
    }),

  setResult: (result) =>
    set({
      result,
    }),
}));