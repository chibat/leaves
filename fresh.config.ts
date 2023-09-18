import { defineConfig } from "$fresh/server.ts";
import { initPool } from "~/server/db.ts";
import { env } from "~/server/env.ts";

export default defineConfig({});

env.init();
initPool();
