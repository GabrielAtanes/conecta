"use client";

import { useReactionController } from "@/controllers/useReactionController";

export default function ReactionButtons({ challengeId }: { challengeId: string }) {
  const reactions = useReactionController(challengeId);
  const { summary } = reactions;

  return (
    <section className="reaction-bar" aria-label="Avaliar desafio">
      <span className="reaction-title">Gostou do desafio?</span>
      <button
        type="button"
        className={`reaction-button ${summary.userReaction === 1 ? "active-like" : ""}`}
        aria-pressed={summary.userReaction === 1}
        disabled={reactions.isSaving}
        onClick={() => void reactions.like()}
      >
        <span aria-hidden="true">👍</span> {summary.likes}
        <span className="sr-only"> curtidas</span>
      </button>
      <button
        type="button"
        className={`reaction-button ${summary.userReaction === -1 ? "active-dislike" : ""}`}
        aria-pressed={summary.userReaction === -1}
        disabled={reactions.isSaving}
        onClick={() => void reactions.dislike()}
      >
        <span aria-hidden="true">👎</span> {summary.dislikes}
        <span className="sr-only"> descurtidas</span>
      </button>
      {reactions.error && <p className="reaction-error" role="alert">{reactions.error}</p>}
    </section>
  );
}