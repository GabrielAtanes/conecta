"use client";

import { useMemo, useState } from "react";
import { Challenge } from "@/models/challenge";

export type SortMode = "az" | "difficulty" | "likes" | "date";

function sortChallenges(challenges: Challenge[], mode: SortMode) {
  const copy = [...challenges];
  const byTitle = (left: Challenge, right: Challenge) =>
    left.title.localeCompare(right.title, "pt-BR");

  if (mode === "az") {
    copy.sort(byTitle);
    return copy;
  }

  if (mode === "difficulty") {
    copy.sort((left, right) => right.errorCount - left.errorCount || byTitle(left, right));
    return copy;
  }

  if (mode === "likes") {
    copy.sort((left, right) => right.likes - left.likes || byTitle(left, right));
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