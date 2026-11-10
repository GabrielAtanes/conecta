"use client";

import { useCommentsController } from "@/controllers/useCommentsController";
import { MAX_COMMENT_LENGTH } from "@/models/comment";

export default function CommentsSection({ challengeId }: { challengeId: string }) {
  const comments = useCommentsController(challengeId);

  return (
    <section className="comments-section" aria-label="Comentários">
      <h3>Comentários</h3>

      <form className="comment-form" onSubmit={comments.submit}>
        <textarea
          value={comments.text}
          onChange={(event) => comments.updateText(event.target.value)}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="Deixe um comentário sobre o desafio"
          aria-label="Escrever comentário"
        />
        <div className="comment-form-footer">
          <span className="comment-counter">{comments.text.length}/{MAX_COMMENT_LENGTH}</span>
          <button
            type="submit"
            className="comment-submit"
            disabled={comments.isSubmitting || comments.text.trim().length === 0}
          >
            {comments.isSubmitting ? "Enviando..." : "Comentar"}
          </button>
        </div>
      </form>

      {comments.error && <p className="comment-error" role="alert">{comments.error}</p>}

      {comments.isLoading ? (
        <p className="comment-empty">Carregando comentários...</p>
      ) : comments.comments.length === 0 ? (
        <p className="comment-empty">Ainda não há comentários. Seja o primeiro!</p>
      ) : (
        <ul className="comment-list">
          {comments.comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-meta">
                <strong>{comment.username}{comment.isMine ? " (você)" : ""}</strong>
                <time dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </time>
              </div>
              <p>{comment.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}