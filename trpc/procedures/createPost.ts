import { z } from "zod";
import { publicProcedure } from "~/trpc/context.ts";
import { insertPost, pool } from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";

export const createPost = publicProcedure.input(
  z.object({ source: z.string().max(10000), draft: z.boolean() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  const userId = session.user.id;
  console.log("### debug", input.draft);
  const postId = await pool((client) =>
    insertPost(client, {
      userId,
      source: input.source,
      draft: input.draft,
    })
  );
  return { postId };
});
