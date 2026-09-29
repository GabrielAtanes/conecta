"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type AuthenticatedNavbarProps = {
  user: {
    username: string;
    email: string;
  };
};

export default function AuthenticatedNavbar({ user }: AuthenticatedNavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const searchQuery = searchParams.get("q") ?? "";
  const initial = Array.from(user.username.trim())[0]?.toLocaleUpperCase("pt-BR") ?? "?";

  async function logout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Falha no logout");

      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Não foi possível sair. Tente novamente.");
    }
  }

  return (
    <header className="app-navbar-shell">
      <nav className="app-navbar" aria-label="Navegação principal">
        <Link className="app-navbar-brand" href="/desafios" aria-label="Conecta, página de desafios">
          Conecta
        </Link>
        <form className="app-navbar-search" action="/desafios" method="get" role="search">
          <input
            key={searchQuery}
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Barra de pesquisa"
            aria-label="Pesquisar desafios"
          />
        </form>
        <Link
          className="create-challenge-button"
          href="/desafios/novo"
          aria-label="Criar novo desafio"
          title="Criar novo desafio"
        >
          +
        </Link>
        <div className="account-menu">
          <button
            className="account-avatar"
            type="button"
            aria-label="Abrir opções da conta"
            aria-expanded={isAccountMenuOpen}
            onClick={() => setIsAccountMenuOpen((open) => !open)}
          >
            {initial}
          </button>
          {isAccountMenuOpen && (
            <div className="account-popover">
              <span className="account-name">{user.username}</span>
              <span className="account-email">{user.email}</span>
              {logoutError && <p className="account-error" role="alert">{logoutError}</p>}
              <button className="account-logout" type="button" onClick={logout}>Sair</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}