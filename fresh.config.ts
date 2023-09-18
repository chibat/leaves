import { defineConfig } from "$fresh/server.ts";
import { initPool } from "~/server/db.ts";
import { env } from "~/server/env.ts";

export default defineConfig({});

if (Deno.args.at(0) !== "build") {
  env.init();
  initPool();
}
