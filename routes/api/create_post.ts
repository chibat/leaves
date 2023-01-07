import { Handlers } from "$fresh/server.ts";
import { insertPost, pool } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export type CreatePostRequest = { source: string };
export type CreatePostResponse = { postId: number };

export const handler: Handlers = {
  async POST(request) {
    console.log(request.url);

    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }

    const requestJson: CreatePostRequest = await request.json();
    if (!requestJson) {
      return Response.json(null);
    }
    if (requestJson.source.length > 10000) {
      return Response.json(null, { status: 400 });
    }
    const userId = session.user.id;
    const postId = await pool((client) =>
      insertPost(client, {
        userId,
        source: requestJson.source,
      })
    );
    const responseJson: CreatePostResponse = { postId };
    return Response.json(responseJson);
  },
};
