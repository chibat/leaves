import { publicProcedure } from "~/server/trpc/context.ts";
import * as db from "~/server/db.ts";

import { getSession } from "~/server/auth.ts";

export const deleteUser = publicProcedure.mutation(async ({ ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  await db.pool(async (client) => {
    await db.deleteUser(client, session.user.id);
    await db.deleteSession(client, session);
  });
  return { userId: session.user.id };
});
