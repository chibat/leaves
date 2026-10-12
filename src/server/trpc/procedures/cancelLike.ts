import { z } from "zod";
import { deleteLike } from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";
import { publicProcedure } from "~/server/trpc/context.ts";

export const cancelLike = publicProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await deleteLike({
    userId: session.user.id,
    postId: input.postId,
  });
  return {};
});
