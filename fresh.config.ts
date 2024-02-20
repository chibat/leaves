import { defineConfig } from "$fresh/server.ts";
import { initSupabase } from "~/server/db.ts";
import { env } from "~/server/env.ts";
import trpcPlugin from "~/plugins/trpc.ts";
import { appRouter } from "~/server/trpc/router.ts";

export default defineConfig({ plugins: [trpcPlugin(appRouter)] });

if (Deno.args.at(0) !== "build") {
  env.init();
  initSupabase();
}
