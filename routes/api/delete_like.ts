import { Handlers } from "$fresh/server.ts";
import { deleteLike, pool } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = { postId: number };
export type ResponseType = {};

export const handler: Handlers = {
  async POST(request) {
    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }

    const requestJson: RequestType = await request.json();
    if (requestJson) {
      await pool((client) =>
        deleteLike(client, {
          userId: session.user.id,
          postId: requestJson.postId,
        })
      );
      return Response.json({});
    }

    return Response.json(null);
  },
};
