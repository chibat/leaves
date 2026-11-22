import { inferAsyncReturnType, TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getSession } from "~/server/auth.ts";

export function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const user = { name: req.headers.get("username") ?? "anonymous" };
  return { req, resHeaders, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
const trpc = initTRPC.context<Context>().create();
export const publicProcedure = trpc.procedure;
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = await getSession(ctx.req);
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session } });
});
export const router = trpc.router;
