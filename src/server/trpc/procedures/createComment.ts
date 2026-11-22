import { z } from "zod";
import { insertComment } from "~/server/db.ts";
import { protectedProcedure } from "~/server/trpc/context.ts";

export type RequestType = { postId: number; source: string };

export const createComment = protectedProcedure.input(
  z.object({ postId: z.number(), source: z.string() }),
).mutation(async ({ input, ctx }) => {
  if (input.source.length > 5000) {
    return;
  }
  await insertComment({
    postId: input.postId,
    userId: ctx.session.user.id,
    source: input.source,
  });
});
