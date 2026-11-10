import Link from "next/link";
import Image from "next/image";

export default function HomeScreen() {
  return (
    <main className="auth-page welcome-page">
      <section className="welcome-content">
        <Link className="brand-link" href="/" aria-label="Ir para a página inicial">
          <h1 className="brand">
            <Image src="/logo.png" alt="Conecta" width={320} height={104} priority />
          </h1>
        </Link>
        <p>Criando conexões através de jogos.<br />Resolva os desafios de outros jogadores.</p>
        <div className="welcome-actions">
          <Link className="primary-button welcome-action-button" href="/login">Login</Link>
          <Link className="primary-button welcome-action-button" href="/signup">Sign-up</Link>
        </div>
      </section>
    </main>
  );
}