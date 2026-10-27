"use client";

import { useMemo, useState } from "react";

export type ModerationReport = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  reporterUsername: string;
  reporterEmail: string;
  reason: string;
  details: string | null;
  status: string;
  adminResponse: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

const reasonLabels: Record<string, string> = {
  palavras_ofensivas: "Palavras ofensivas",
  preconceituoso: "Preconceituoso",
  spam_propaganda: "Spam ou propaganda",
  conteudo_improprio: "Conteúdo impróprio",
  outro: "Outro motivo",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  reviewed: "Em revisão",
  resolved: "Resolvido",
  rejected: "Rejeitado",
};

function formatStatus(status: string) {
  return statusLabels[status] ?? status;
}

export default function ReportsAdminPanel({ reports }: { reports: ModerationReport[] }) {
  const [items, setItems] = useState(reports);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status: string; response: string }>>(() =>
    Object.fromEntries(
      reports.map((report) => [report.id, { status: report.status, response: report.adminResponse ?? "" }]),
    ),
  );

  const summary = useMemo(() => ({
    total: items.length,
    pending: items.filter((report) => report.status === "pending").length,
    reviewed: items.filter((report) => report.status === "reviewed").length,
    resolved: items.filter((report) => report.status === "resolved").length,
    rejected: items.filter((report) => report.status === "rejected").length,
  }), [items]);

  async function updateReport(reportId: string, status: string, adminResponse: string) {
    const response = await fetch(`/api/challenges/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminResponse }),
    });

    const payload = await response.json().catch(() => null) as { error?: string; report?: ModerationReport } | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? "Não foi possível atualizar a denúncia.");
    }

    if (!payload?.report) return;

    setItems((current) => current.map((item) => item.id === reportId ? payload.report! : item));
    setDrafts((current) => ({
      ...current,
      [reportId]: { status: payload.report!.status, response: payload.report!.adminResponse ?? "" },
    }));
    setFeedback("Atualização salva com sucesso.");
  }

  return (
    <main className="reports-page">
      <section className="reports-shell">
        <div className="reports-header">
          <div>
            <p className="eyebrow">Central de moderação</p>
            <h1>Denúncias recebidas</h1>
          </div>
        </div>

        <div className="reports-summary-grid">
          <article className="summary-card summary-card-pending">
            <span>Total</span>
            <strong>{summary.total}</strong>
          </article>
          <article className="summary-card summary-card-review">
            <span>Pendentes</span>
            <strong>{summary.pending}</strong>
          </article>
          <article className="summary-card summary-card-accepted">
            <span>Em revisão</span>
            <strong>{summary.reviewed}</strong>
          </article>
          <article className="summary-card summary-card-closed">
            <span>Resolvidos</span>
            <strong>{summary.resolved}</strong>
          </article>
          <article className="summary-card summary-card-rejected">
            <span>Rejeitados</span>
            <strong>{summary.rejected}</strong>
          </article>
        </div>

        {feedback && <p className="reports-feedback">{feedback}</p>}

        {items.length === 0 ? (
          <div className="reports-empty">
            <p>Nenhuma denúncia cadastrada no momento.</p>
          </div>
        ) : (
          <div className="reports-list">
            {items.map((report) => (
              <article key={report.id} className="report-card">
                <div className="report-topline">
                  <span className={`report-status report-status-${report.status}`}>
                    {formatStatus(report.status)}
                  </span>
                  <time>{new Date(report.createdAt).toLocaleString("pt-BR")}</time>
                </div>

                <div className="report-headline">
                  <div>
                    <h2>{report.challengeTitle}</h2>
                    <p className="report-meta">Denunciado por: {report.reporterUsername} ({report.reporterEmail})</p>
                  </div>
                  <a href={`/jogo?challenge=${report.challengeId}`} className="report-link">
                    Ver jogo
                  </a>
                </div>

                <p className="report-meta">Motivo: {reasonLabels[report.reason] ?? report.reason}</p>

                {report.details ? (
                  <p className="report-details">{report.details}</p>
                ) : (
                  <p className="report-details empty">Sem detalhes adicionais.</p>
                )}

                <div className="moderation-form-grid">
                  <label>
                    <span>Status do chamado</span>
                    <select
                      value={drafts[report.id]?.status ?? report.status}
                      onChange={(event) => setDrafts((current) => ({
                        ...current,
                        [report.id]: {
                          status: event.target.value,
                          response: current[report.id]?.response ?? report.adminResponse ?? "",
                        },
                      }))}
                    >
                      <option value="pending">Pendente</option>
                      <option value="reviewed">Em revisão</option>
                      <option value="resolved">Resolvido</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                  </label>

                  <label>
                    <span>Resposta ao usuário</span>
                    <textarea
                      rows={3}
                      value={drafts[report.id]?.response ?? report.adminResponse ?? ""}
                      onChange={(event) => setDrafts((current) => ({
                        ...current,
                        [report.id]: {
                          status: current[report.id]?.status ?? report.status,
                          response: event.target.value,
                        },
                      }))}
                      placeholder="Preencha a resposta para o usuário"
                    />
                  </label>
                </div>

                <div className="report-actions-row">
                  <button
                    type="button"
                    className="report-submit"
                    onClick={async () => {
                      const nextDraft = drafts[report.id] ?? { status: report.status, response: report.adminResponse ?? "" };

                      try {
                        await updateReport(report.id, nextDraft.status, nextDraft.response.trim());
                      } catch (error) {
                        setFeedback(error instanceof Error ? error.message : "Falha ao atualizar.");
                      }
                    }}
                  >
                    Salvar atualização
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
