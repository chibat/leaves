import { z } from "zod";
import * as db from "~/server/db.ts";
import { protectedProcedure } from "~/server/trpc/context.ts";

export const deleteFollow = protectedProcedure.input(
  z.object({ followingUserId: z.number() }),
).mutation(async ({ input, ctx }) => {
  await db.deleteFollow({
    userId: ctx.session.user.id,
    followingUserId: input.followingUserId,
  });
  return {};
});
