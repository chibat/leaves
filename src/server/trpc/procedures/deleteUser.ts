import { protectedProcedure } from "~/server/trpc/context.ts";
import * as db from "~/server/db.ts";

export const deleteUser = protectedProcedure.mutation(async ({ ctx }) => {
  await db.deleteUser(ctx.session.user.id);
  await db.deleteSession(ctx.session);
  return { userId: ctx.session.user.id };
});
