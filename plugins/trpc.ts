import {
  FetchCreateContextFn,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";
import {
  AnyRouter,
  inferAsyncReturnType,
  initTRPC,
} from "@trpc/server/dist/index.d.ts";
import { Plugin } from "$fresh/server.ts";
import { defaultCreateContext } from "~/plugins/trpc/context.ts";

type Option = {
  endpoint: string;
  createContext: FetchCreateContextFn<AnyRouter>;
};

export default function plugin(
  router: AnyRouter,
  option: Option = {
    endpoint: "/api/trpc",
    createContext: defaultCreateContext,
  },
): Plugin {
  const path = option.endpoint + "/*";
  return {
    name: "trpc-plugin",
    routes: [{
      path,
      handler: async (req, _ctx) => {
        const trpcRes = await fetchRequestHandler({
          endpoint: option.endpoint,
          req,
          router,
          createContext: option.createContext,
        });
        return new Response(trpcRes.body, {
          headers: trpcRes.headers,
          status: trpcRes.status,
        });
      },
    }],
  };
}
