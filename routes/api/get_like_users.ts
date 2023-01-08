import { pool, selectLikeUsers } from "~/lib/db.ts";
import { defaultString } from "~/lib/utils.ts";

import { Handlers } from "$fresh/server.ts";

export type RequestType = { postId: number };
export type ResponseType = Array<{ id: number; name: string; picture: string }>;

export const handler: Handlers = {
  async POST(request) {
    const params: RequestType = await request.json();
    const results =
      (await pool((client) => selectLikeUsers(client, params.postId))).map(
        (appUser) => {
          return {
            id: appUser.id,
            name: defaultString(appUser.name),
            picture: defaultString(appUser.picture),
          };
        },
      );
    return Response.json(results);
  },
};
