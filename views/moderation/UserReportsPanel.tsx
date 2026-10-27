"use client";

import { useMemo, useState } from "react";

export type UserReport = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  reason: string;
  details: string | null;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
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

export default function UserReportsPanel({ reports }: { reports: UserReport[] }) {
  const [items] = useState(reports);
  const summary = useMemo(() => ({
    total: items.length,
    abertas: items.filter((report) => report.status !== "resolved" && report.status !== "rejected").length,
    resolvidas: items.filter((report) => report.status === "resolved" || report.status === "rejected").length,
  }), [items]);

  return (
    <main className="reports-page">
      <section className="reports-shell">
        <div className="reports-header">
          <div>
            <p className="eyebrow">Meus chamados</p>
            <h1>Histórico de denúncias</h1>
          </div>
        </div>

        <div className="reports-summary-grid">
          <article className="summary-card summary-card-pending">
            <span>Totais</span>
            <strong>{summary.total}</strong>
          </article>
          <article className="summary-card summary-card-review">
            <span>Abertos</span>
            <strong>{summary.abertas}</strong>
          </article>
          <article className="summary-card summary-card-closed">
            <span>Finalizados</span>
            <strong>{summary.resolvidas}</strong>
          </article>
        </div>

        {items.length === 0 ? (
          <div className="reports-empty">
            <p>Você ainda não enviou nenhuma denúncia.</p>
          </div>
        ) : (
          <div className="reports-list">
            {items.map((report) => (
              <article key={report.id} className="report-card">
                <div className="report-topline">
                  <span className={`report-status report-status-${report.status}`}>
                    {statusLabels[report.status] ?? report.status}
                  </span>
                  <time>{new Date(report.createdAt).toLocaleString("pt-BR")}</time>
                </div>

                <div className="report-headline">
                  <div>
                    <h2>{report.challengeTitle}</h2>
                    <p className="report-meta">Motivo: {reasonLabels[report.reason] ?? report.reason}</p>
                  </div>
                  <a href={`/jogo?challenge=${report.challengeId}`} className="report-link">
                    Ver jogo
                  </a>
                </div>

                {report.details ? <p className="report-details">{report.details}</p> : <p className="report-details empty">Sem descrição do usuário.</p>}

                <div className="user-response-box">
                  <h3>Resposta da moderação</h3>
                  {report.adminResponse ? (
                    <>
                      <p>{report.adminResponse}</p>
                      {report.resolvedAt && <small>Finalizado em: {new Date(report.resolvedAt).toLocaleString("pt-BR")}</small>}
                    </>
                  ) : (
                    <p className="report-details empty">Ainda não houve retorno desta denúncia.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
