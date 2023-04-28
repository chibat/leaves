import { z } from "zod";
import { deleteLike, pool } from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";
import { publicProcedure } from "~/server/trpc/context.ts";

export const cancelLike = publicProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await pool((client) =>
    deleteLike(client, {
      userId: session.user.id,
      postId: input.postId,
    })
  );
  return {};
});
