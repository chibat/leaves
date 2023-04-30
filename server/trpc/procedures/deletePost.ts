import { z } from "zod";
import { publicProcedure } from "~/server/trpc/context.ts";
import * as db from "~/server/db.ts";

import { getSession } from "~/server/auth.ts";

export const deletePost = publicProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  await db.pool((client) =>
    db.deletePost(client, { id: input.postId, userId: session.user.id })
  );
  return { postId: input.postId };
});
