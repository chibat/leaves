import { Handlers } from "$fresh/server.ts";
import { getSession } from "~/lib/auth.ts";
import { pool, selectLikes } from "~/lib/db.ts";

export type RequestType = { postId: number };

export const handler: Handlers = {
  async POST(request) {
    console.log(request.url);
    const params: RequestType = await request.json();
    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }
    const results = await pool((client) =>
      selectLikes(client, {
        userId: session.u.id,
        postIds: [params.postId],
      }) // TODO: to one postId
    );
    console.log("results", results);
    return Response.json(results.length === 1);
  },
};
