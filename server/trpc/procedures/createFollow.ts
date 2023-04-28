import { z } from "zod";
import { publicProcedure } from "~/server/trpc/context.ts";
import { insertFollow, pool } from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";

export const createFollow = publicProcedure.input(
  z.object({ followingUserId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  await pool((client) =>
    insertFollow(client, {
      userId: session.user.id,
      followingUserId: input.followingUserId,
    })
  );
  return {};
});
