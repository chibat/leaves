import { publicProcedure } from "../../../plugins/trpc/context.ts";
import * as db from "~/server/db.ts";

import { getSession } from "~/server/auth.ts";

export default publicProcedure.mutation(async ({ ctx }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    return null;
  }
  await db.deleteUser(session.user.id);
  await db.deleteSession(session);
  return { userId: session.user.id };
});
