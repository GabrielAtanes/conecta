import { hash } from "bcryptjs";
import { createSession } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    username?: unknown;
    password?: unknown;
    rememberMe?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }
  if (!/^[\p{L}\p{N}_.-]{3,24}$/u.test(username)) {
    return Response.json({ error: "O nome de usuário deve ter de 3 a 24 caracteres." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }

  try {
    const passwordHash = await hash(password, 12);
    const result = await getPool().query<{ id: string; email: string; username: string }>(
      "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username",
      [email, username, passwordHash],
    );
    const user = result.rows[0];
    await createSession(user.id, body?.rememberMe === true);

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return Response.json({ error: "Este e-mail ou nome de usuário já está em uso." }, { status: 409 });
    }

    console.error("Falha ao criar conta:", error);
    return Response.json({ error: "Não foi possível criar a conta agora." }, { status: 500 });
  }
}