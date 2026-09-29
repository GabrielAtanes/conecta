import { compare } from "bcryptjs";
import { createSession } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
    rememberMe?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "Informe seu e-mail e senha." }, { status: 400 });
  }

  try {
    const result = await getPool().query<{
      id: string;
      email: string;
      username: string;
      password_hash: string;
    }>("SELECT id, email, username, password_hash FROM users WHERE lower(email) = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await compare(password, user.password_hash))) {
      return Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    await createSession(user.id, body?.rememberMe === true);
    return Response.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("Falha ao entrar:", error);
    return Response.json({ error: "Não foi possível entrar agora." }, { status: 500 });
  }
}