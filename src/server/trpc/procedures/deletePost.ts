import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/context.ts";
import * as db from "~/server/db.ts";

export const deletePost = protectedProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  await db.deletePost({ id: input.postId, userId: ctx.session.user.id });
  return { postId: input.postId };
});
