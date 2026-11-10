"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Comment, MAX_COMMENT_LENGTH } from "@/models/comment";

export function useCommentsController(challengeId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/challenges/${challengeId}/comments`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { comments?: Comment[]; error?: string }
          | null;
        if (!response.ok) throw new Error(payload?.error ?? "Não foi possível carregar os comentários.");
        return payload?.comments ?? [];
      })
      .then((list) => {
        if (!cancelled) setComments(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar comentários.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  function updateText(value: string) {
    setText(value.slice(0, MAX_COMMENT_LENGTH));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = text.trim();
    if (!body || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/challenges/${challengeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { comment?: Comment; error?: string }
        | null;

      if (!response.ok || !payload?.comment) {
        throw new Error(payload?.error ?? "Não foi possível enviar o comentário.");
      }
      const created = payload.comment;
      setComments((current) => [created, ...current]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o comentário.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { comments, text, isLoading, isSubmitting, error, updateText, submit };
}