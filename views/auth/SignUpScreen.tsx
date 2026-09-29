"use client";

import { useAuthController } from "@/controllers/useAuthController";
import GoogleAuthButton from "@/views/auth/GoogleAuthButton";
import Link from "next/link";

export default function SignUpScreen() {
  const auth = useAuthController("signup");

  return (
    <main className="auth-page form-page">
      <Link className="brand-link" href="/" aria-label="Ir para a página inicial">
        <h1 className="brand">Conecta</h1>
      </Link>
      <section className="auth-panel">
        <h2>Crie sua conta</h2>
        <p className="panel-intro">Entre para jogar e conhecer novas pessoas.</p>
        <form onSubmit={auth.submit}>
          <label>
            <span>E-mail</span>
            <input type="email" value={auth.form.email} onChange={(event) => auth.updateField("email", event.target.value)} required />
          </label>
          <label>
            <span>Nome de usuário</span>
            <input value={auth.form.username} onChange={(event) => auth.updateField("username", event.target.value)} minLength={3} maxLength={24} required />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" value={auth.form.password} onChange={(event) => auth.updateField("password", event.target.value)} minLength={8} required />
          </label>
          {auth.error && <p className="auth-error" role="alert">{auth.error}</p>}
          <button className="submit-button" type="submit" disabled={auth.isSubmitting}>
            {auth.isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
        <div className="divider"><span>ou</span></div>
        <GoogleAuthButton />
        <p className="switch-copy">
          Já tem uma conta?{" "}
          <Link className="text-button switch-button" href="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}