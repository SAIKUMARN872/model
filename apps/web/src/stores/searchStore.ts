import { create } from "zustand";

interface SearchStore {
  query: string;
  results: string[];

  setQuery: (query: string) => void;
  setResults: (results: string[]) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",

  results: [],

  setQuery: (query) =>
    set({
      query,
    }),

  setResults: (results) =>
    set({
      results,
    }),
}));