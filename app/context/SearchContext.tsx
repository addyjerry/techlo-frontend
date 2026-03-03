"use client";

import { createContext, useContext, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const SearchContext = createContext<SearchContextValue>({
  query: "",
  setQuery: () => {},
  activeFilter: "all",
  setActiveFilter: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery]               = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  return (
    <SearchContext.Provider value={{ query, setQuery, activeFilter, setActiveFilter }}>
      {children}
    </SearchContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSearch() {
  return useContext(SearchContext);
}