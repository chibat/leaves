/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { start } from "$fresh/server.ts";
import manifest from "~/fresh.gen.ts";
import { initPool } from "~/server/db.ts";
import { env } from "~/server/env.ts";
import { initKv } from "~/server/kv.ts";

// const render: RenderFunction = (ctx, render) => {
//   ctx.lang = "ja";
//   render();
// };

env.init();
initPool();
initKv();
await start(manifest);
