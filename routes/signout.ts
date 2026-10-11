import type { Handlers } from "~/server/route.ts";
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
    response.headers.append(
      "Set-Cookie",
      "session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
    );
    return response;
  },
};
