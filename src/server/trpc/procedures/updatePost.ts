import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/context.ts";
import * as db from "~/server/db.ts";

export const updatePost = protectedProcedure.input(
  z.object({
    postId: z.number(),
    source: z.string().max(10000),
    draft: z.boolean(),
  }),
).mutation(async ({ input, ctx }) => {
  await db.updatePost({
    postId: input.postId,
    userId: ctx.session.user.id,
    source: input.source,
    draft: input.draft,
  });
  return {};
});
