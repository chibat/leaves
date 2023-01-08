import { AppUser, pool, selectFollowingUsers } from "~/lib/db.ts";
import { defaultString } from "~/lib/utils.ts";

import { Handlers } from "$fresh/server.ts";

export type RequestType = { userId: number };
export type ResponseType = Array<AppUser>;

export const handler: Handlers = {
  async POST(request) {
    const params: RequestType = await request.json();
    const results =
      (await pool((client) => selectFollowingUsers(client, params.userId))).map(
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
