import "server-only";

import * as oidc from "openid-client";

const googleIssuer = new URL("https://accounts.google.com");
let configurationPromise: Promise<oidc.Configuration> | undefined;

export const googleOAuthCookies = {
  state: "conecta_google_state",
  nonce: "conecta_google_nonce",
  verifier: "conecta_google_verifier",
} as const;

export function getGoogleOAuthSettings() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL;

  if (!clientId || !clientSecret || !appUrl) {
    throw new Error("Configure APP_URL, GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.");
  }

  const applicationUrl = new URL(appUrl);
  if (applicationUrl.pathname !== "/" || applicationUrl.search || applicationUrl.hash) {
    throw new Error("APP_URL deve conter apenas a origem da aplicação.");
  }
  if (process.env.NODE_ENV === "production" && applicationUrl.protocol !== "https:") {
    throw new Error("APP_URL precisa usar HTTPS em produção.");
  }

  return { clientId, clientSecret, appOrigin: applicationUrl.origin };
}

export async function getGoogleConfiguration() {
  const { clientId, clientSecret } = getGoogleOAuthSettings();
  configurationPromise ??= oidc.discovery(googleIssuer, clientId, clientSecret);
  return configurationPromise;
}