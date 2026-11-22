import { z } from "zod";
import { deleteLike } from "~/server/db.ts";
import { protectedProcedure } from "~/server/trpc/context.ts";

export const cancelLike = protectedProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  await deleteLike({
    userId: ctx.session.user.id,
    postId: input.postId,
  });
  return {};
});
