import { setCookie } from "std/http/cookie.ts";

export function setAccessTokenToCookie(response: Response, accessToken: string) {
  setCookie(response.headers, {
    name: "access",
    value: accessToken,
    sameSite: "Strict",
    httpOnly: true,
    secure: true,
    path: "/",
  });
}
