"use client";

import { useMemo, useState } from "react";
import { Challenge, challengesMock } from "@/models/challenge";

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

export function useChallengesController(initialSearch = "") {
  const [search, setSearch] = useState(initialSearch);
  const [sortMode, setSortMode] = useState<SortMode>("az");

  const filteredChallenges = useMemo(() => {
    const bySearch = challengesMock.filter((challenge) => {
      const query = search.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return challenge.title.toLowerCase().includes(query);
    });

    return sortChallenges(bySearch, sortMode);
  }, [search, sortMode]);

  return {
    search,
    sortMode,
    filteredChallenges,
    setSearch,
    setSortMode,
  };
}