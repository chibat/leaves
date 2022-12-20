import { Handlers } from "$fresh/server.ts";
import { getCookies, deleteCookie } from "std/http/cookie.ts";

export const handler: Handlers = {
  async GET(request, ctx) {
    const response = new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
    const cookies = getCookies(request.headers);
    const accessToken = cookies["access"];
    if (accessToken) {
      await fetch(
        "https://accounts.google.com/o/oauth2/revoke?" +
        new URLSearchParams([["token", accessToken]]),
      );
    }
    deleteCookie(response.headers, "access");
    deleteCookie(response.headers, "refresh");
    return response;
  },
}

