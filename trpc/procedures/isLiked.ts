import { z } from "zod";
import { getSession } from "~/lib/auth.ts";
import { pool, selectLikes } from "~/lib/db.ts";
import { publicProcedure } from "~/trpc/context.ts";

export const isLiked = publicProcedure.input(
  z.object({ postId: z.number() }),
).query(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return Response.json(null, { status: 401 });
  }
  const results = await pool((client) =>
    selectLikes(client, {
      userId: session.user.id,
      postIds: [input.postId],
    }) // TODO: to one postId
  );
  return results.length === 1;
});
