import "server-only";

import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";

type GoogleUser = {
  id: string;
  email: string;
  username: string;
};

export async function findOrCreateGoogleUser(subject: string, email: string) {
  const pool = getPool();
  const linkedUser = await pool.query<GoogleUser>(
    "SELECT id, email, username FROM users WHERE google_sub = $1",
    [subject],
  );
  if (linkedUser.rows[0]) return linkedUser.rows[0];

  const existingEmail = await pool.query<GoogleUser>(
    "SELECT id, email, username FROM users WHERE lower(email) = $1",
    [email],
  );
  if (existingEmail.rows[0]) {
    const linkedAccount = await pool.query<GoogleUser>(
      "UPDATE users SET google_sub = $1 WHERE id = $2 AND google_sub IS NULL RETURNING id, email, username",
      [subject, existingEmail.rows[0].id],
    );
    return linkedAccount.rows[0] ?? null;
  }

  const usernameBase = email
    .split("@", 1)[0]
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}_.-]/gu, "")
    .slice(0, 15)
    .toLowerCase() || "google";
  const username = `${usernameBase}_${randomBytes(4).toString("hex")}`;

  try {
    const createdUser = await pool.query<GoogleUser>(
      "INSERT INTO users (email, username, password_hash, google_sub) VALUES ($1, $2, NULL, $3) RETURNING id, email, username",
      [email, username, subject],
    );
    return createdUser.rows[0];
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      const concurrentLogin = await pool.query<GoogleUser>(
        "SELECT id, email, username FROM users WHERE google_sub = $1",
        [subject],
      );
      if (concurrentLogin.rows[0]) return concurrentLogin.rows[0];

      const concurrentEmailSignup = await pool.query<GoogleUser>(
        "SELECT id, email, username FROM users WHERE lower(email) = $1",
        [email],
      );
      if (concurrentEmailSignup.rows[0]) {
        const linkedAccount = await pool.query<GoogleUser>(
          "UPDATE users SET google_sub = $1 WHERE id = $2 AND google_sub IS NULL RETURNING id, email, username",
          [subject, concurrentEmailSignup.rows[0].id],
        );
        return linkedAccount.rows[0] ?? null;
      }
    }

    throw error;
  }
}