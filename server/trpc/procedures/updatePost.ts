import { z } from "zod";
import { publicProcedure } from "~/plugins/trpc/context.ts";
import * as db from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";

export default publicProcedure.input(
  z.object({
    postId: z.number(),
    source: z.string().max(10000),
    draft: z.boolean(),
  }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await db.updatePost({
    postId: input.postId,
    userId: session.user.id,
    source: input.source,
    draft: input.draft,
  });
  return {};
});
