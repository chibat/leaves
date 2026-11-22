import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/context.ts";
import { insertPost } from "~/server/db.ts";

export const createPost = protectedProcedure.input(
  z.object({ source: z.string().max(10000), draft: z.boolean() }),
).mutation(async ({ input, ctx }) => {
  const userId = ctx.session.user.id;
  const postId = await insertPost({
    userId,
    source: input.source,
    draft: input.draft,
  });
  return { postId };
});
