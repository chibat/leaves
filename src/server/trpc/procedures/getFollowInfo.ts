import {
  judgeFollowing,
  selectCountFollower,
  selectCountFollowing,
} from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";
import { publicProcedure } from "~/server/trpc/context.ts";
import { z } from "zod";

export const getFollowInfo = publicProcedure.input(
  z.object({ userId: z.number() }),
).query(async ({ input, ctx }) => {
  const following = await selectCountFollowing(input.userId);
  const followers = await selectCountFollower(input.userId);
  const session = await getSession(ctx.req);
  let isFollowing = false;
  if (session) {
    isFollowing = await judgeFollowing({
      userId: session.user.id,
      followingUserId: input.userId,
    });
  }
  return { following, followers, isFollowing };
});
