import * as auth from "~/lib/auth.ts";
import { publicProcedure } from "~/trpc/context.ts";

export const getSession = publicProcedure.query(({ ctx }) => {
  return auth.getSession(ctx.req);
});
