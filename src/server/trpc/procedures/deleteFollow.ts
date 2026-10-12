import { z } from "zod";
import * as db from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";
import { publicProcedure } from "~/server/trpc/context.ts";

export const deleteFollow = publicProcedure.input(
  z.object({ followingUserId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await db.deleteFollow({
    userId: session.user.id,
    followingUserId: input.followingUserId,
  });
  return {};
});
