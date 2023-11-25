import { getCookies, setCookie } from "$std/http/cookie.ts";
import { AppUser, insertSession, selectSession } from "~/server/db.ts";
import { env } from "~/server/env.ts";

export type SessionType = { id: string; user: AppUser };
export async function getSession(req: Request) {
  const cookies = getCookies(req.headers);
  const sessionId = cookies["session"];
  if (!sessionId) {
    return undefined;
  }
  const user = await selectSession(sessionId);
  if (!user) {
    return undefined;
  }
  return { id: sessionId, user };
}

export async function createSession(response: Response, userId: number) {
  const sessionId = await insertSession(userId);
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  setCookie(response.headers, {
    name: "session",
    value: sessionId,
    expires,
    sameSite: "Lax",
    httpOnly: true,
    secure: true,
    path: "/",
  });
}

export function getCallbackUrl(requestUrl: string) {
  const url = new URL(requestUrl);
  return (url.hostname === "localhost" ? "http" : "https") + "://" + url.host +
    "/callback";
}

export function getAuthUrl(requestUrl: string): string {
  const redirectUri = getCallbackUrl(requestUrl);
  if (!env.clientId) {
    throw new Error("clientId is undefined");
  }
  return "https://accounts.google.com/o/oauth2/auth?" +
    new URLSearchParams([
      ["client_id", env.clientId],
      ["redirect_uri", redirectUri],
      ["scope", "https://www.googleapis.com/auth/userinfo.profile"],
      ["access_type", "offline"],
      ["response_type", "code"],
    ]).toString();
}
