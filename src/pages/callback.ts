import type { APIRoute } from "astro";
import { env } from "~/server/env.ts";
import { createSession, getCallbackUrl } from "~/server/auth.ts";
import { selectUserByGoogleId, upsertUser } from "~/server/db.ts";

type Token = { access_token: string };
type GoogleUser = { id: string; name: string; picture: string };

export const GET: APIRoute = async ({ request }) => {
  const code = new URL(request.url).searchParams.get("code");
  const response = new Response(
    "<!doctype html><html><head><meta charset=\"utf-8\"></head><body><script>location.href = '/';</script></body></html>",
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
  if (!code) return response;

  const tokenResponse = await fetch("https://accounts.google.com/o/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams([
      ["client_id", env.clientId],
      ["client_secret", env.clientSecret],
      ["redirect_uri", getCallbackUrl(request.url)],
      ["grant_type", "authorization_code"],
      ["code", code],
    ]),
  });
  if (!tokenResponse.ok) {
    throw new Error(`Google token exchange failed: ${tokenResponse.status}`);
  }
  const { access_token } = await tokenResponse.json() as Token;

  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?" +
      new URLSearchParams([["access_token", access_token]]),
  );
  const googleUser = await userResponse.json() as GoogleUser;
  if (!userResponse.ok) {
    throw new Error(`Google user lookup failed: ${JSON.stringify(googleUser)}`);
  }
  await fetch(
    "https://accounts.google.com/o/oauth2/revoke?" +
      new URLSearchParams([["token", access_token]]),
  );

  const existingUser = await selectUserByGoogleId(googleUser.id);
  const user = existingUser &&
      existingUser.name === googleUser.name &&
      existingUser.picture === googleUser.picture
    ? existingUser
    : await upsertUser({
      googleId: googleUser.id,
      name: googleUser.name,
      picture: googleUser.picture,
    });
  await createSession(response, user.id);
  return response;
};
