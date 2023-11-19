import { z } from "zod";
import { publicProcedure } from "~/server/trpc/context.ts";
import { insertPost } from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";

export const createPost = publicProcedure.input(
  z.object({ source: z.string().max(10000), draft: z.boolean() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  const userId = session.user.id;
  const postId = await insertPost({
    userId,
    source: input.source,
    draft: input.draft,
  });
  return { postId };
});
