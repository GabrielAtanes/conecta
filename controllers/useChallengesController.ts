"use client";

import { useMemo, useState } from "react";
import { Challenge } from "@/models/challenge";

type SortMode = "az" | "errors" | "date";

function sortChallenges(challenges: Challenge[], mode: SortMode) {
  const copy = [...challenges];

  if (mode === "az") {
    copy.sort((left, right) => left.title.localeCompare(right.title, "pt-BR"));
    return copy;
  }

  if (mode === "errors") {
    copy.sort((left, right) => left.errorCount - right.errorCount);
    return copy;
  }

  copy.sort((left, right) => Number(new Date(right.publishedAt)) - Number(new Date(left.publishedAt)));
  return copy;
}

export function useChallengesController(challenges: Challenge[], initialSearch = "") {
  const [search, setSearch] = useState(initialSearch);
  const [sortMode, setSortMode] = useState<SortMode>("az");

  const filteredChallenges = useMemo(() => {
    const bySearch = challenges.filter((challenge) => {
      const query = search.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return challenge.title.toLowerCase().includes(query);
    });

    return sortChallenges(bySearch, sortMode);
  }, [challenges, search, sortMode]);

  return {
    search,
    sortMode,
    filteredChallenges,
    setSearch,
    setSortMode,
  };
}