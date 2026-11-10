"use client";

import { useEffect, useState } from "react";
import { emptyReactionSummary, ReactionSummary } from "@/models/reaction";

export function useReactionController(challengeId: string) {
  const [summary, setSummary] = useState<ReactionSummary>(emptyReactionSummary);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/challenges/${challengeId}/reaction`)
      .then(async (response) => (response.ok ? ((await response.json()) as ReactionSummary) : null))
      .then((data) => {
        if (!cancelled && data) setSummary(data);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  async function react(value: 1 | -1) {
    if (isSaving) return;
    setIsSaving(true);
    setError("");

    // Clicar de novo na mesma reação remove a avaliação.
    const removing = summary.userReaction === value;

    try {
      const response = await fetch(`/api/challenges/${challengeId}/reaction`, {
        method: removing ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: removing ? undefined : JSON.stringify({ value }),
      });
      const payload = (await response.json().catch(() => null)) as
        | (ReactionSummary & { error?: string })
        | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "Não foi possível salvar sua avaliação.");
      }
      setSummary({
        likes: payload.likes,
        dislikes: payload.dislikes,
        userReaction: payload.userReaction,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar sua avaliação.");
    } finally {
      setIsSaving(false);
    }
  }

  return { summary, isSaving, error, like: () => react(1), dislike: () => react(-1) };
}