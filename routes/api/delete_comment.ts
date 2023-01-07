import { Handlers } from "$fresh/server.ts";
import { deleteComment, pool } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = { commentId: number };
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
        deleteComment(client, {
          id: requestJson.commentId,
          userId: session.user.id,
        })
      );
    }

    return Response.json({});
  },
};
