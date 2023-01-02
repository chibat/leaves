import { getCookies } from "std/http/cookie.ts";
import { deserializeJwt } from "~/lib/jwt.ts";
import { AppUser } from "~/lib/db.ts";
import { clientId } from "~/lib/env.ts";

export type JwtType = { u: AppUser };

const debug = false;

export async function getSession(req: Request): Promise<JwtType | undefined> {
  if (debug) {
    return {
      u: {
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
  const sessionString = cookies["session"];
  return sessionString
    ? await deserializeJwt(sessionString) as JwtType
    : undefined;
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
