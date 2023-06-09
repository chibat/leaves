import { z } from "zod";
import { publicProcedure } from "~/server/trpc/context.ts";
import * as db from "~/server/db.ts";
import { getSession } from "~/server/auth.ts";

export const updatePost = publicProcedure.input(
  z.object({
    postId: z.number(),
    source: z.string().max(10000),
    draft: z.boolean(),
  }),
).mutation(async ({ input, ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null; // TODO
  }
  await db.pool((client) =>
    db.updatePost(client, {
      postId: input.postId,
      userId: session.user.id,
      source: input.source,
      draft: input.draft,
    }).catch((error) => {
      console.log(error);
    })
  );
  return {};
});
