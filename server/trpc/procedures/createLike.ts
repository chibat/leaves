import { z } from "zod";
import { publicProcedure } from "~/server/trpc/context.ts";
import { insertLike, pool } from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";

export const createLike = publicProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await insertLike({
    userId: session.user.id,
    postId: input.postId,
  });
  return {};
});
