"use client";

import { useWordBoardController } from "@/controllers/useWordBoardController";
import Link from "next/link";

export default function WordBoardScreen() {
  const board = useWordBoardController();

  return (
    <main className="auth-page word-board-page">
      <section className="word-board-content">
        <Link className="brand-link" href="/desafios" aria-label="Voltar para lista de desafios">
          <h1 className="brand">Conecta</h1>
        </Link>

        <p className="word-board-subtitle">{board.board.title}</p>

        <header className="word-board-header">
          <span>data de publicacao</span>
          <span>{board.board.errorCountLabel}</span>
        </header>

        <section className="word-board-grid" aria-label="Grade de palavras do desafio">
          {board.tiles.map((tile, index) => (
            <button
              type="button"
              key={tile.id}
              draggable
              onClick={() => board.toggleTile(tile.id)}
              onDragStart={() => board.onDragStart(index)}
              onDragEnter={() => board.onDragEnter(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => board.onDrop(index)}
              onDragEnd={board.onDragEnd}
              className={[
                "word-tile",
                board.selectedIds.has(tile.id) ? "selected" : "",
                board.draggedIndex === index ? "dragging" : "",
                board.overIndex === index ? "drop-target" : "",
              ].join(" ").trim()}
            >
              {tile.label}
            </button>
          ))}
        </section>
      </section>
    </main>
  );
}