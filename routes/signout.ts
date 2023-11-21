import { Handlers } from "$fresh/server.ts";
import { deleteCookie } from "$std/http/cookie.ts";
import { getSession } from "~/server/auth.ts";
import { deleteSession } from "~/server/db.ts";

export const handler: Handlers = {
  async GET(request) {
    const session = await getSession(request);
    if (session) {
      await deleteSession(session);
    }
    const response = new Response("", {
      status: 307,
      headers: { Location: "/" },
    });
    deleteCookie(response.headers, "session");
    return response;
  },
};
