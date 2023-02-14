import {
  judgeFollowing,
  pool,
  selectCountFollower,
  selectCountFollowing,
} from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";
import { publicProcedure } from "~/trpc/context.ts";
import { z } from "zod";

export const getFollowInfo = publicProcedure.input(
  z.object({ userId: z.number() }),
).query(({ input, ctx }) => {
  return pool(async (client) => {
    const following = await selectCountFollowing(client, input.userId);
    const followers = await selectCountFollower(client, input.userId);
    const isFollowing = await (async () => {
      const session = await getSession(ctx.req);
      if (session) {
        return await judgeFollowing(client, {
          userId: session.user.id,
          followingUserId: input.userId,
        });
      }
      return false;
    })();
    return { following, followers, isFollowing };
  });
});
