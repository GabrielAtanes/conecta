"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChallengeForm,
  challengeGroupColors,
  emptyChallengeForm,
} from "@/models/challenge-form";

const groupLabels = ["Grupo 1", "Grupo 2", "Grupo 3", "Grupo 4"];

export default function NewChallengeScreen() {
  const router = useRouter();
  const [form, setForm] = useState<ChallengeForm>(emptyChallengeForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateTitle(value: string) {
    setForm((current) => ({ ...current, title: value }));
    setError("");
  }

  function updateGroup(groupIndex: number, field: "title" | "connection", value: string) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, index) => (
        index === groupIndex ? { ...group, [field]: value } : group
      )),
    }));
    setError("");
  }

  function updateWord(groupIndex: number, wordIndex: number, value: string) {
    setForm((current) => ({
      ...current,
      groups: current.groups.map((group, index) => {
        if (index !== groupIndex) return group;

        return {
          ...group,
          words: group.words.map((word, currentWordIndex) => (
            currentWordIndex === wordIndex ? value : word
          )),
        };
      }),
    }));
    setError("");
  }

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error ?? "Não foi possível publicar o desafio.");
        return;
      }

      router.replace("/desafios");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page new-challenge-page">
      <section className="new-challenge-content">
        <div className="new-challenge-heading">
          <div>
            <p className="eyebrow">Novo desafio</p>
            <h1>Crie um jogo para a comunidade</h1>
          </div>
          <Link className="cancel-challenge-link" href="/desafios">Cancelar</Link>
        </div>

        <form className="challenge-editor-form" onSubmit={publish}>
          <label className="challenge-title-field">
            <span>Título do desafio</span>
            <input
              value={form.title}
              onChange={(event) => updateTitle(event.target.value)}
              maxLength={80}
              placeholder="Ex.: Coisas que encontramos na cozinha"
              required
            />
          </label>

          <div className="challenge-editor-grid">
            {form.groups.map((group, groupIndex) => (
              <fieldset className={`challenge-editor-group editor-${challengeGroupColors[groupIndex]}`} key={groupIndex}>
                <legend>{groupLabels[groupIndex]}</legend>
                <label>
                  <span>Nome do grupo</span>
                  <input
                    value={group.title}
                    onChange={(event) => updateGroup(groupIndex, "title", event.target.value)}
                    maxLength={40}
                    placeholder="Ex.: Utensílios"
                    required
                  />
                </label>
                <label>
                  <span>Conexão</span>
                  <input
                    value={group.connection}
                    onChange={(event) => updateGroup(groupIndex, "connection", event.target.value)}
                    maxLength={80}
                    placeholder="O que une estas palavras?"
                    required
                  />
                </label>
                <div className="challenge-word-fields">
                  {group.words.map((word, wordIndex) => (
                    <label key={wordIndex}>
                      <span>Palavra {wordIndex + 1}</span>
                      <input
                        value={word}
                        onChange={(event) => updateWord(groupIndex, wordIndex, event.target.value)}
                        maxLength={30}
                        required
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          {error && <p className="auth-error challenge-form-error" role="alert">{error}</p>}
          <div className="challenge-submit-row">
            <p>Revise as palavras antes de publicar. Depois disso, o desafio fica disponível para outros jogadores.</p>
            <button className="submit-button publish-challenge-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar desafio"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}