import * as oidc from "openid-client";
import { NextResponse } from "next/server";
import { getGoogleConfiguration, getGoogleOAuthSettings, googleOAuthCookies } from "@/lib/google-oauth";

export const runtime = "nodejs";

const oauthCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth/google/callback",
  maxAge: 600,
};

export async function POST() {
  try {
    const { appOrigin } = getGoogleOAuthSettings();
    const configuration = await getGoogleConfiguration();
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const verifier = oidc.randomPKCECodeVerifier();
    const challenge = await oidc.calculatePKCECodeChallenge(verifier);
    const callbackUrl = new URL("/api/auth/google/callback", appOrigin).toString();
    const authorizationUrl = oidc.buildAuthorizationUrl(configuration, {
      redirect_uri: callbackUrl,
      scope: "openid email profile",
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    const response = NextResponse.json({ authorizationUrl: authorizationUrl.toString() });
    response.cookies.set(googleOAuthCookies.state, state, oauthCookieOptions);
    response.cookies.set(googleOAuthCookies.nonce, nonce, oauthCookieOptions);
    response.cookies.set(googleOAuthCookies.verifier, verifier, oauthCookieOptions);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível iniciar o login com Google.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}