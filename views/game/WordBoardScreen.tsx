"use client";

import { useWordBoardController } from "@/controllers/useWordBoardController";
import { WordBoard } from "@/models/word-board";

export default function WordBoardScreen({ initialBoard }: { initialBoard: WordBoard }) {
  async function saveProgress(errorCount: number, completed: boolean) {
    await fetch(`/api/challenges/${initialBoard.id}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errorCount, completed }),
    });
  }

  const board = useWordBoardController(initialBoard, saveProgress);

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
            Você já concluiu este desafio.
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
    </main>
  );
}