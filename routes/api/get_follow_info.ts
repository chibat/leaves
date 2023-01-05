import { Handlers } from "$fresh/server.ts";
import {
  judgeFollowing,
  pool,
  selectCountFollower,
  selectCountFollowing,
} from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export type RequestType = { userId: number };
export type ResponseType = {
  following: string;
  followers: string;
  isFollowing: boolean;
};

export const handler: Handlers = {
  async POST(request) {
    const params: RequestType = await request.json();
    const result = await pool(async (client) => {
      const following = await selectCountFollowing(client, params.userId);
      const followers = await selectCountFollower(client, params.userId);
      const isFollowing = await (async () => {
        const session = await getSession(request);
        if (session) {
          return await judgeFollowing(client, {
            userId: session.u.id,
            followingUserId: params.userId,
          });
        }
        return false;
      })();
      return { following, followers, isFollowing };
    });

    return Response.json(result);
  },
};
