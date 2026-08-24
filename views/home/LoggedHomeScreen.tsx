"use client";

import { useChallengesController } from "@/controllers/useChallengesController";
import Link from "next/link";

export default function LoggedHomeScreen() {
  const challenges = useChallengesController();

  return (
    <main className="auth-page logged-home-page">
      <section className="logged-home-content">
        <Link className="brand-link" href="/" aria-label="Ir para a página inicial">
          <h1 className="brand">Conecta</h1>
        </Link>
        <p>Criando conexões através de jogos.<br />Resolva os desafios de outros jogadores.</p>

        <div className="challenge-search-wrap">
          <input
            type="search"
            value={challenges.search}
            onChange={(event) => challenges.setSearch(event.target.value)}
            placeholder="Pesquisa"
            aria-label="Pesquisa de desafios"
          />
        </div>

        <section className="challenge-list-panel">
          <h2>Filtros</h2>
          <div className="challenge-filters">
            <button
              type="button"
              className={challenges.sortMode === "az" ? "active" : ""}
              onClick={() => challenges.setSortMode("az")}
            >
              A-Z
            </button>
            <button
              type="button"
              className={challenges.sortMode === "errors" ? "active" : ""}
              onClick={() => challenges.setSortMode("errors")}
            >
              Rating
            </button>
            <button
              type="button"
              className={challenges.sortMode === "date" ? "active" : ""}
              onClick={() => challenges.setSortMode("date")}
            >
              Data de publicacao
            </button>
          </div>

          <div className="challenge-cards">
            {challenges.filteredChallenges.map((challenge) => (
              <Link key={challenge.id} href="/jogo" className="challenge-card">
                <span className="challenge-title">{challenge.title}</span>
                <span className="challenge-meta">
                  {new Date(challenge.publishedAt).toLocaleDateString("pt-BR")} · {challenge.errorCount} erros
                </span>
              </Link>
            ))}
            {challenges.filteredChallenges.length === 0 && (
              <p className="empty-challenges">Nenhum desafio encontrado para sua pesquisa.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}