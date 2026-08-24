"use client";

import { useState } from "react";
import { AuthForm, AuthMode, emptyAuthForm } from "@/models/auth";

export function useAuthController() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<AuthForm>(emptyAuthForm);
  const [rememberMe, setRememberMe] = useState(false);

  function updateField(field: keyof AuthForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function open(modeToOpen: Exclude<AuthMode, "welcome">) {
    setMode(modeToOpen);
  }

  function reset() {
    setMode("login");
    setForm(emptyAuthForm);
    setRememberMe(false);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return {
    mode,
    form,
    rememberMe,
    setRememberMe,
    updateField,
    open,
    reset,
    submit,
  };
}