import { z } from "zod";
import { getSession } from "~/server/auth.ts";
import { selectLikes } from "~/server/db.ts";
import { publicProcedure } from "~/plugins/trpc/context.ts";

export default publicProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  const results = await selectLikes({
    userId: session.user.id,
    postIds: [input.postId],
  }); // TODO: to one postId
  return results.length === 1;
});
