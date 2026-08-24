"use client";

import { useAuthController } from "@/controllers/useAuthController";
import Link from "next/link";

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link className="brand-link" href="/" onClick={onClick} aria-label="Ir para a página inicial">
      <h1 className="brand">Conecta</h1>
    </Link>
  );
}

export default function AuthScreen() {
  const auth = useAuthController();

  return (
    <main className="auth-page form-page">
      <Brand onClick={auth.reset} />
      <section className="auth-panel">
        <h2>Bem-vindo de volta</h2>
        <p className="panel-intro">Entre para continuar suas conexões.</p>
        <form onSubmit={auth.submit}>
          <label>
            <span>E-mail</span>
            <input type="email" value={auth.form.email} onChange={(event) => auth.updateField("email", event.target.value)} required />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" value={auth.form.password} onChange={(event) => auth.updateField("password", event.target.value)} required />
          </label>
        <div className="form-options">
            <label className="remember-option"><input type="checkbox" checked={auth.rememberMe} onChange={(event) => auth.setRememberMe(event.target.checked)} /> <span>Lembre-se de mim</span></label>
            <button type="button" className="text-button">Esqueceu sua senha?</button>
        </div>
          <button className="submit-button" type="submit">Login</button>
        </form>
        <div className="divider"><span>ou</span></div>
        <button type="button" className="google-button">Conecte-se via Google</button>
        <p className="switch-copy">
          Ainda não tem uma conta?{" "}
          <Link className="text-button switch-button" href="/signup">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}