import { Handlers } from "$fresh/server.ts";
import { getAuthUrl, getSession } from "~/lib/auth.ts";

export const handler: Handlers = {
  async GET(request) {

    const session = await getSession(request);
    if (session) {
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }

    const authUrl = getAuthUrl(request.url);
    return Response.redirect(authUrl);
  },
}

