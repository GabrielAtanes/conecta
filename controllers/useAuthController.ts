"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthForm, AuthMode, emptyAuthForm } from "@/models/auth";

export function useAuthController(initialMode: Exclude<AuthMode, "welcome">) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState<AuthForm>(emptyAuthForm);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof AuthForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function open(modeToOpen: Exclude<AuthMode, "welcome">) {
    setMode(modeToOpen);
  }

  function reset() {
    setMode(initialMode);
    setForm(emptyAuthForm);
    setRememberMe(false);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rememberMe }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error ?? "Não foi possível autenticar. Tente novamente.");
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

  return {
    mode,
    form,
    rememberMe,
    isSubmitting,
    error,
    setRememberMe,
    updateField,
    open,
    reset,
    submit,
  };
}