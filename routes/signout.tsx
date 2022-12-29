import { Handlers } from "$fresh/server.ts";
import { deleteCookie } from "std/http/cookie.ts";

export const handler: Handlers = {
  GET() {
    const response = new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
    deleteCookie(response.headers, "session");
    return response;
  },
}

