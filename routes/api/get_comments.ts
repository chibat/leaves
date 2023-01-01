import { pool, selectComments } from "~/lib/db.ts";

import type { Comment } from "~/lib/db.ts";
import { Handlers } from "$fresh/server.ts";

export type RequestType = { postId: number };
export type ResponseType = Array<Comment>;

export const handler: Handlers = {
  async POST(request) {
    const params: RequestType = await request.json();
    const result: ResponseType = await pool((client) =>
      selectComments(client, params.postId)
    );
    return Response.json(result);
  },
};
