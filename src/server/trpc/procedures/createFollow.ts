import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/context.ts";
import { insertFollow } from "~/server/db.ts";

export const createFollow = protectedProcedure.input(
  z.object({ followingUserId: z.number() }),
).mutation(async ({ input, ctx }) => {
  await insertFollow({
    userId: ctx.session.user.id,
    followingUserId: input.followingUserId,
  });
  return {};
});
