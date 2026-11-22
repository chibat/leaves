import { z } from "zod";
import { selectLikes } from "~/server/db.ts";
import { protectedProcedure } from "~/server/trpc/context.ts";

export const isLiked = protectedProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input, ctx }) => {
  const results = await selectLikes({
    userId: ctx.session.user.id,
    postIds: [input.postId],
  }); // TODO: to one postId
  return results.length === 1;
});
