import * as auth from "~/server/auth.ts";
import { publicProcedure } from "~/plugins/trpc/context.ts";

export default publicProcedure.query(({ ctx }) => {
  return auth.getSession(ctx.req);
});
