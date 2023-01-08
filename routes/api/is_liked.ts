import { Handlers } from "$fresh/server.ts";
import { getSession } from "~/lib/auth.ts";
import { pool, selectLikes } from "~/lib/db.ts";

export type RequestType = { postId: number };

export const handler: Handlers = {
  async POST(request) {
    const params: RequestType = await request.json();
    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }
    const results = await pool((client) =>
      selectLikes(client, {
        userId: session.user.id,
        postIds: [params.postId],
      }) // TODO: to one postId
    );
    return Response.json(results.length === 1);
  },
};
