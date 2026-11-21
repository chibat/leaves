import { AppUser, insertSession, selectSession } from "~/server/db.ts";
import { env } from "~/server/env.ts";

export type SessionType = { id: string; user: AppUser };
export async function getSession(req: Request) {
  const sessionId = req.headers.get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("session="))
    ?.slice("session=".length);
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
  response.headers.append(
    "Set-Cookie",
    `session=${encodeURIComponent(sessionId)}; Expires=${expires.toUTCString()}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  );
}

export function createOAuthState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getCookieValue(request: Request, name: string): string | undefined {
  const prefix = `${name}=`;
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));
  if (!cookie) return undefined;
  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return undefined;
  }
}

export function getOAuthStateCookie(state: string): string {
  return `oauth_state=${encodeURIComponent(state)}; Max-Age=600; Path=/callback; HttpOnly; Secure; SameSite=Lax`;
}

export function clearOAuthStateCookie(): string {
  return "oauth_state=; Max-Age=0; Path=/callback; HttpOnly; Secure; SameSite=Lax";
}

export function validateOAuthState(request: Request): boolean {
  const state = new URL(request.url).searchParams.get("state");
  const cookieState = getCookieValue(request, "oauth_state");
  return Boolean(state && cookieState && state === cookieState);
}

export function getCallbackUrl(requestUrl: string) {
  const url = new URL(requestUrl);
  const protocol = url.hostname === "localhost" || url.hostname === "127.0.0.1"
    ? "http"
    : "https";
  return `${protocol}://${url.host}/callback`;
}

export function getAuthUrl(requestUrl: string, state: string): string {
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
      ["state", state],
    ]).toString();
}
