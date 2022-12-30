import { Handlers } from "$fresh/server.ts";
import { insertFollow, pool } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = { followingUserId: number };
export type ResponseType = {};

export const handler: Handlers = {
  async POST(request) {
    console.log(request.url);

    const session = await getSession(request);
    if (!session) {
      return Response.json(null, { status: 401 });
    }

    const requestJson: RequestType = await request.json();
    if (requestJson) {
      await pool((client) =>
        insertFollow(client, {
          userId: session.u.id,
          followingUserId: requestJson.followingUserId,
        })
      );
      const responseJson: ResponseType = {};
      return Response.json(responseJson);
    }

    return Response.json({});
  },
};
