import { z } from "zod";
import { publicProcedure } from "~/trpc/context.ts";
import { insertPost, pool } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export const createPost = publicProcedure.input(
  z.object({ source: z.string().max(10000) }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  const userId = session.user.id;
  const postId = await pool((client) =>
    insertPost(client, {
      userId,
      source: input.source,
    })
  );
  return { postId };
});
