import { z } from "zod";
import * as db from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";
import { publicProcedure } from "~/trpc/context.ts";

export const deleteFollow = publicProcedure.input(
  z.object({ followingUserId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await db.pool((client) =>
    db.deleteFollow(client, {
      userId: session.user.id,
      followingUserId: input.followingUserId,
    })
  );
  return {};
});
