import { z } from "zod";
import * as db from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";
import { publicProcedure } from "../../../plugins/trpc/context.ts";

export default publicProcedure.input(
  z.object({ commentId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await db.deleteComment({
    id: input.commentId,
    userId: session.user.id,
  });
  return {};
});
