import { getCookies } from "std/http/cookie.ts";
import { deserializeJwt } from "~/lib/jwt.ts";
import { AppUser } from "~/lib/db.ts";

export type JwtType = { u: AppUser };

export async function getSession(req: Request) {
    const cookies = getCookies(req.headers);
    const sessionString = cookies["session"];
    return sessionString ? await deserializeJwt(sessionString) as JwtType : undefined;
}

export function getCallbackUrl(requestUrl: string) {
  console.log(`${requestUrl} requestUrl`);
  const url = new URL(requestUrl);
  return (url.hostname === "localhost" ? "http" : "https") + "://" + url.host + "/callback";
}
