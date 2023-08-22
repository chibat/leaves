import { getCookies, setCookie } from "$std/http/cookie.ts";
import * as kv from "~/server/kv.ts";
import { AppUser, pool, selectSession } from "~/server/db.ts";
import { env } from "~/server/env.ts";

export type SessionType = { id: string; user: AppUser };

export async function getSession(
  req: Request,
): Promise<SessionType | undefined> {
  const cookies = getCookies(req.headers);
  const sessionId = cookies["session"];
  if (!sessionId) {
    return undefined;
  }
  const user = await pool((client) => selectSession(client, sessionId));
  if (!user) {
    return undefined;
  }
  return { id: sessionId, user };
}

export async function createSession(response: Response, userId: number) {
  const sessionId = await kv.createSession(userId);
  setCookie(response.headers, {
    name: "session",
    value: sessionId,
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
