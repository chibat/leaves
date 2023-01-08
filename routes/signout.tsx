import { Handlers } from "$fresh/server.ts";
import { deleteCookie } from "std/http/cookie.ts";
import { getSession } from "~/lib/auth.ts";
import { deleteSession, pool } from "~/lib/db.ts";

export const handler: Handlers = {
  async GET(request) {
    const session = await getSession(request);
    if (session) {
      await pool(client => deleteSession(client, session));
    }
    const response = new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
    deleteCookie(response.headers, "session");
    return response;
  },
}

