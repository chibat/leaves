import { deletePost, pool } from "~/lib/db.ts";

import { Handlers } from "https://deno.land/x/fresh@1.1.2/server.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = { postId: number };
export type ResponseType = { postId: number };

export const handler: Handlers = {
  async POST(request) {
    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }

    const requestJson: RequestType = await request.json();
    if (requestJson) {
      await pool((client) =>
        deletePost(client, { id: requestJson.postId, userId: session.user.id })
      );
      const responseJson: ResponseType = { postId: requestJson.postId };
      return Response.json(responseJson);
    }

    return Response.json(null);
  },
};
