import { z } from "zod";
import { getSession } from "~/server/auth.ts";
import { pool, selectLikes } from "~/server/db.ts";
import { publicProcedure } from "~/server/trpc/context.ts";

export const isLiked = publicProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  const results = await pool((client) =>
    selectLikes({
      userId: session.user.id,
      postIds: [input.postId],
    }) // TODO: to one postId
  );
  return results.length === 1;
});
