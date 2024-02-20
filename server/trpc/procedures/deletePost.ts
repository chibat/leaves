import { z } from "zod";
import { publicProcedure } from "../../../plugins/trpc/context.ts";
import * as db from "~/server/db.ts";

import { getSession } from "~/server/auth.ts";

export default publicProcedure.input(
  z.object({ postId: z.number() }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  await db.deletePost({ id: input.postId, userId: session.user.id });
  return { postId: input.postId };
});
