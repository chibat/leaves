import { AppUser, pool, selectFollowerUsers } from "~/lib/db.ts";
import { defaultString } from "~/lib/utils.ts";

import { Handlers } from "$fresh/server.ts";

export type RequestType = { userId: number };
export type ResponseType = Array<AppUser>;

export const handler: Handlers = {
  async POST(request) {
    console.log(request.url);
    const params: RequestType = await request.json();
    const results =
      (await pool((client) => selectFollowerUsers(client, params.userId))).map(
        (appUser) => {
          return {
            userId: appUser.id,
            name: defaultString(appUser.name),
            picture: defaultString(appUser.picture),
          };
        },
      );
    return Response.json(results);
  },
};
