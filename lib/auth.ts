import { getCookies, setCookie } from "std/http/cookie.ts";
import { AppUser, insertSession, pool, selectSession } from "~/lib/db.ts";
import { clientId } from "~/lib/env.ts";

export type SessionType = { id: string; user: AppUser };

const debug = false;

export async function getSession(
  req: Request,
): Promise<SessionType | undefined> {
  if (debug) {
    return {
      id: "47fe0ced-6569-45f6-88e6-d02cfdefb72b",
      user: {
        id: 1,
        google_id: "1",
        name: "Tomofumi Chiba",
        picture:
          "https://lh3.googleusercontent.com/a/AEdFTp50r3WlI_9VqwRr7RLSwnbZFqhStQRokJ4JdIoPeBU=s96-c",
        notification: false,
        created_at: "2022-12-28T14:30:11.171Z",
        updated_at: "2022-12-28T14:30:11.171Z",
      },
    };
  }
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
  const sessionId = await pool((client) => insertSession(client, userId));
  setCookie(response.headers, {
    name: "session",
    value: sessionId,
    sameSite: "Strict",
    httpOnly: true,
    secure: true,
    path: "/",
  });
}

export function getCallbackUrl(requestUrl: string) {
  console.log(`${requestUrl} requestUrl`);
  const url = new URL(requestUrl);
  return (url.hostname === "localhost" ? "http" : "https") + "://" + url.host +
    "/callback";
}

export function getAuthUrl(requestUrl: string): string {
  const redirectUri = getCallbackUrl(requestUrl);
  if (!clientId) {
    throw new Error("clientId is undefined");
  }
  return "https://accounts.google.com/o/oauth2/auth?" +
    new URLSearchParams([
      ["client_id", clientId],
      ["redirect_uri", redirectUri],
      ["scope", "https://www.googleapis.com/auth/userinfo.profile"],
      ["access_type", "offline"],
      ["response_type", "code"],
    ]).toString();
}
