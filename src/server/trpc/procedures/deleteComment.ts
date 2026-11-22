import { z } from "zod";
import * as db from "~/server/db.ts";
import { protectedProcedure } from "~/server/trpc/context.ts";

export const deleteComment = protectedProcedure.input(
  z.object({ commentId: z.number() }),
).mutation(async ({ input, ctx }) => {
  await db.deleteComment({
    id: input.commentId,
    userId: ctx.session.user.id,
  });
  return {};
});
