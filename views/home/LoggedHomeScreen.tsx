"use client";

import { useChallengesController } from "@/controllers/useChallengesController";
import { Challenge } from "@/models/challenge";
import Link from "next/link";

export default function LoggedHomeScreen({
  challenges: availableChallenges,
  initialSearch,
}: {
  challenges: Challenge[];
  initialSearch: string;
}) {
  const challenges = useChallengesController(availableChallenges, initialSearch);

  return (
    <main className="auth-page logged-home-page">
      <section className="logged-home-content">
        <h1 className="logged-home-title">Desafios</h1>
        <p>Criando conexões através de jogos.<br />Resolva os desafios de outros jogadores.</p>

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
              <Link key={challenge.id} href={`/jogo?challenge=${challenge.id}`} className="challenge-card">
                <span className="challenge-title">{challenge.title}</span>
                <span className="challenge-meta">
                  Criado por {challenge.creatorUsername} · {new Date(challenge.publishedAt).toLocaleDateString("pt-BR")}
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