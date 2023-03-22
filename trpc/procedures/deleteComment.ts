import { z } from "zod";
import * as db from "~/lib/db.ts";
import { getSession } from "~/lib/auth.ts";
import { publicProcedure } from "~/trpc/context.ts";

export const deleteComment = publicProcedure.input(
  z.object({ commentId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await db.pool((client) =>
    db.deleteComment(client, {
      id: input.commentId,
      userId: session.user.id,
    })
  );
  return {};
});
