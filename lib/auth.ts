import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const sessionCookieName = "conecta_session";
const sessionCookieLifetime = 60 * 60 * 24;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET precisa ter pelo menos 32 caracteres.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string, rememberMe: boolean) {
  const maxAge = rememberMe ? sessionCookieLifetime * 30 : sessionCookieLifetime;
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getAuthSecret());

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(rememberMe ? { maxAge } : {}),
  });
}

export async function getSessionUserId() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(sessionCookieName);
}