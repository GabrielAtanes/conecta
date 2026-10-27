"use client";

import { useState } from "react";
import { useWordBoardController } from "@/controllers/useWordBoardController";
import { WordBoard } from "@/models/word-board";

const REPORT_REASONS = [
  { value: "palavras_ofensivas", label: "Palavras ofensivas" },
  { value: "preconceituoso", label: "Preconceituoso" },
  { value: "spam_propaganda", label: "Spam ou propaganda" },
  { value: "conteudo_improprio", label: "Conteúdo impróprio" },
  { value: "outro", label: "Outro motivo" },
] as const;

export default function WordBoardScreen({ initialBoard }: { initialBoard: WordBoard }) {
  const [showVictoryCard, setShowVictoryCard] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<(typeof REPORT_REASONS)[number]["value"]>(REPORT_REASONS[0].value);
  const [details, setDetails] = useState("");
  const [reportFeedback, setReportFeedback] = useState("");
  const [reportError, setReportError] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  async function saveProgress(errorCount: number, completed: boolean) {
    await fetch(`/api/challenges/${initialBoard.id}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errorCount, completed }),
    });
  }

  async function handleReportSubmit() {
    setReportError("");
    setReportFeedback("");
    setIsSubmittingReport(true);

    try {
      const response = await fetch(`/api/challenges/${initialBoard.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          details: details.trim(),
        }),
      });

      const payload = await response.json().catch(() => null) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível enviar a denúncia.");
      }

      setReportFeedback("Denúncia enviada com sucesso. A equipe será avisada.");
      setDetails("");
      setSelectedReason(REPORT_REASONS[0].value);
      setIsReportOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a denúncia.";
      setReportError(message);
    } finally {
      setIsSubmittingReport(false);
    }
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

          <div className="word-board-actions">
            <span>{board.board.errorCountLabel}: {board.errorCount}</span>
            <div className="report-button-wrap">
              <button
                type="button"
                className="report-button"
                aria-expanded={isReportOpen}
                aria-controls="challenge-report-panel"
                onClick={() => setIsReportOpen((previous) => !previous)}
              >
                <span aria-hidden="true">⚑</span>
                Denunciar
              </button>

              {isReportOpen && (
                <div id="challenge-report-panel" className="report-popover" role="dialog" aria-label="Denunciar desafio">
                  <h3>Denunciar este jogo</h3>

                  <div className="report-options">
                    {REPORT_REASONS.map((reason) => (
                      <label key={reason.value} className="report-option">
                        <input
                          type="radio"
                          name="challenge-report-reason"
                          value={reason.value}
                          checked={selectedReason === reason.value}
                          onChange={() => setSelectedReason(reason.value)}
                        />
                        <span>{reason.label}</span>
                      </label>
                    ))}
                  </div>

                  <textarea
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    rows={4}
                    maxLength={300}
                    placeholder="Descreva o problema (opcional)"
                    aria-label="Detalhes da denúncia"
                  />

                  <div className="report-actions">
                    <button type="button" className="report-cancel" onClick={() => setIsReportOpen(false)}>
                      Fechar
                    </button>
                    <button type="button" className="report-submit" onClick={() => void handleReportSubmit()} disabled={isSubmittingReport}>
                      {isSubmittingReport ? "Enviando..." : "Enviar denúncia"}
                    </button>
                  </div>

                  {reportError && <p className="report-error-message">{reportError}</p>}
                  {reportFeedback && <p className="report-success-message">{reportFeedback}</p>}
                </div>
              )}
            </div>
          </div>
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