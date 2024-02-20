import { z } from "zod";
import { publicProcedure } from "../../../plugins/trpc/context.ts";
import { insertFollow } from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";

export default publicProcedure.input(
  z.object({ followingUserId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  await insertFollow({
    userId: session.user.id,
    followingUserId: input.followingUserId,
  });
  return {};
});
