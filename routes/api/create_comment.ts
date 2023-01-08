import { Handlers } from "$fresh/server.ts";
import { insertComment, pool } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = { postId: number; source: string };
export type ResponseType = {};

export const handler: Handlers = {
  async POST(request: Request) {
    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }

    const requestJson: RequestType = await request.json();
    if (requestJson) {
      if (requestJson.source.length > 5000) {
        return Response.json(null, { status: 400 });
      }
      await pool((client) =>
        insertComment(client, {
          postId: requestJson.postId,
          userId: session.user.id,
          source: requestJson.source,
        })
      );
      return Response.json({});
    }

    return Response.json({});
  },
};
