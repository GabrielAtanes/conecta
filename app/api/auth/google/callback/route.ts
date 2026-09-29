import * as oidc from "openid-client";
import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { findOrCreateGoogleUser } from "@/lib/google-account";
import { getGoogleConfiguration, getGoogleOAuthSettings, googleOAuthCookies } from "@/lib/google-oauth";

export const runtime = "nodejs";

function redirectToLogin(appOrigin: string, reason: string) {
  const loginUrl = new URL("/login", appOrigin);
  loginUrl.searchParams.set("google", reason);
  const response = NextResponse.redirect(loginUrl);
  for (const cookieName of Object.values(googleOAuthCookies)) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth/google/callback",
      maxAge: 0,
    });
  }
  return response;
}

export async function GET(request: NextRequest) {
  let appOrigin = request.nextUrl.origin;
  try {
    const settings = getGoogleOAuthSettings();
    appOrigin = settings.appOrigin;
    const state = request.cookies.get(googleOAuthCookies.state)?.value;
    const nonce = request.cookies.get(googleOAuthCookies.nonce)?.value;
    const verifier = request.cookies.get(googleOAuthCookies.verifier)?.value;
    const responseState = request.nextUrl.searchParams.get("state");

    if (!state || !nonce || !verifier || state !== responseState) {
      return redirectToLogin(appOrigin, "failed");
    }
    if (request.nextUrl.searchParams.has("error")) {
      return redirectToLogin(appOrigin, "cancelled");
    }

    const configuration = await getGoogleConfiguration();
    const callbackUrl = new URL("/api/auth/google/callback", appOrigin);
    callbackUrl.search = request.nextUrl.search;
    const tokenResponse = await oidc.authorizationCodeGrant(configuration, callbackUrl, {
      pkceCodeVerifier: verifier,
      expectedState: state,
      expectedNonce: nonce,
      idTokenExpected: true,
    });
    const claims = tokenResponse.claims();

    if (
      typeof claims?.sub !== "string" ||
      typeof claims.email !== "string" ||
      claims.email_verified !== true
    ) {
      return redirectToLogin(appOrigin, "failed");
    }

    const user = await findOrCreateGoogleUser(claims.sub, claims.email.trim().toLowerCase());
    if (!user) return redirectToLogin(appOrigin, "account_exists");

    const response = NextResponse.redirect(new URL("/desafios", appOrigin));
    for (const cookieName of Object.values(googleOAuthCookies)) {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/api/auth/google/callback",
        maxAge: 0,
      });
    }
    return setSessionCookie(response, user.id, false);
  } catch (error) {
    console.error("Falha na autenticação Google:", error);
    return redirectToLogin(appOrigin, "failed");
  }
}