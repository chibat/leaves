import * as auth from "~/server/auth.ts";
import { publicProcedure } from "~/server/trpc/context.ts";

export const getSession = publicProcedure.query(({ ctx }) => {
  return auth.getSession(ctx.req);
});
