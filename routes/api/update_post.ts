import { Handlers } from "$fresh/server.ts";
import { pool, updatePost } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = { postId: number; source: string };
export type ResponseType = { postId: number };

export const handler: Handlers = {
  async POST(request) {
    console.log(request.url);

    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }

    const requestJson: RequestType = await request.json();
    if (requestJson) {
      if (requestJson.source.length > 10000) {
        return Response.json(null, { status: 400 });
      }
      await pool((client) =>
        updatePost(client, {
          postId: requestJson.postId,
          userId: session.user.id,
          source: requestJson.source,
        })
      );
      return Response.json(null);
    }

    return Response.json(null);
  },
};
