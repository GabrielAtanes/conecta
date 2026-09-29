"use client";

import { useState, useSyncExternalStore } from "react";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getGoogleResult() {
  return new URLSearchParams(window.location.search).get("google") ?? "";
}

function getServerGoogleResult() {
  return "";
}

export default function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const googleResult = useSyncExternalStore(
    subscribeToLocation,
    getGoogleResult,
    getServerGoogleResult,
  );
  const googleError = googleResult === "account_exists"
    ? "Este e-mail já está vinculado a outra conta Google."
    : googleResult
      ? "Não foi possível entrar com o Google. Tente novamente."
      : "";

  async function startGoogleLogin() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/google", { method: "POST" });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.authorizationUrl !== "string") {
        setError(result?.error ?? "Não foi possível iniciar o login com Google.");
        return;
      }

      window.location.assign(result.authorizationUrl);
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="google-button"
        onClick={startGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? "Conectando..." : "Conecte-se via Google"}
      </button>
      {(error || googleError) && <p className="auth-error" role="alert">{error || googleError}</p>}
    </>
  );
}