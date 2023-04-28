import { inferAsyncReturnType } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

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
export const router = trpc.router;
