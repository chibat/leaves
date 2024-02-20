import { inferAsyncReturnType } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export function defaultCreateContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  return { req, resHeaders };
}

type Context = inferAsyncReturnType<typeof defaultCreateContext>;
const trpc = initTRPC.context<Context>().create();
export const publicProcedure = trpc.procedure;
export const router = trpc.router;
