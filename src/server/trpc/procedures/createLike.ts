import { z } from "zod";
import { protectedProcedure } from "~/server/trpc/context.ts";
import { insertLike } from "~/server/db.ts";

export const createLike = protectedProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  await insertLike({
    userId: ctx.session.user.id,
    postId: input.postId,
  });
  return {};
});
