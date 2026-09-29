"use client";

import { useState } from "react";
import { useWordBoardController } from "@/controllers/useWordBoardController";
import { WordBoard } from "@/models/word-board";

export default function WordBoardScreen({ initialBoard }: { initialBoard: WordBoard }) {
  const [showVictoryCard, setShowVictoryCard] = useState(false);

  async function saveProgress(errorCount: number, completed: boolean) {
    await fetch(`/api/challenges/${initialBoard.id}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errorCount, completed }),
    });
  }

  function handleProgress(errorCount: number, completed: boolean) {
    void saveProgress(errorCount, completed);
    if (completed) setShowVictoryCard(true);
  }

  const board = useWordBoardController(initialBoard, handleProgress);

  return (
    <main className="auth-page word-board-page">
      <section className="word-board-content">
        <p className="word-board-subtitle">{board.board.title}</p>

        <header className="word-board-header">
          <span>Criado por: {board.board.creatorUsername}</span>
          <span>Publicado em: {board.board.publishedAt}</span>
          <span>{board.board.errorCountLabel}: {board.errorCount}</span>
        </header>

        {board.isCompleted && (
          <p className="challenge-completed-message" role="status">
            Desafio concluído · {board.errorCount} {board.errorCount === 1 ? "erro" : "erros"}
          </p>
        )}

        {board.solvedGroups.length > 0 && (
          <section className="solved-groups" aria-label="Grupos resolvidos">
            {board.solvedGroups.map((group) => (
              <article key={group.id} className={`solved-group solved-${group.color}`}>
                <h2>{group.connection}</h2>
                <p>{group.words.join(", ")}</p>
              </article>
            ))}
          </section>
        )}

        {board.unsolvedTiles.length > 0 && (
          <section className="word-board-grid" aria-label="Grade de palavras do desafio">
            {board.unsolvedTiles.map((tile) => (
              <button
                type="button"
                key={tile.id}
                draggable={!board.isResolvingSelection && !board.isTileSolved(tile.id)}
                onClick={() => board.toggleTile(tile.id)}
                onDragStart={() => board.onDragStart(tile.id)}
                onDragEnter={() => board.onDragEnter(tile.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => board.onDrop(tile.id)}
                onDragEnd={board.onDragEnd}
                aria-pressed={board.selectedIds.has(tile.id)}
                disabled={board.isResolvingSelection || board.isCompleted}
                className={[
                  "word-tile",
                  board.selectedIds.has(tile.id) ? "selected" : "",
                  board.invalidIds.has(tile.id) ? "invalid" : "",
                  board.correctIds.has(tile.id) ? "correct" : "",
                  board.draggedTileId === tile.id ? "dragging" : "",
                  board.overTileId === tile.id ? "drop-target" : "",
                ].join(" ").trim()}
              >
                {tile.label}
              </button>
            ))}
          </section>
        )}
      </section>

      {showVictoryCard && (
        <div className="victory-overlay" role="presentation">
          <section className="victory-card" role="dialog" aria-modal="true" aria-labelledby="victory-title">
            <span className="victory-mark" aria-hidden="true">✓</span>
            <p className="victory-kicker">Desafio concluído</p>
            <h2 id="victory-title">Você venceu!</h2>
            <p>Você encontrou todos os grupos em {board.errorCount} {board.errorCount === 1 ? "erro" : "erros"}.</p>
            <button type="button" className="victory-dismiss" onClick={() => setShowVictoryCard(false)}>
              Continuar
            </button>
          </section>
        </div>
      )}
    </main>
  );
}