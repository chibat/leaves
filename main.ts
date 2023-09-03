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

// const render: RenderFunction = (ctx, render) => {
//   ctx.lang = "ja";
//   render();
// };

const kv = await Deno.openKv();

// Persist an object at the users/alice key.
await kv.set(["users", "alice"], { name: "Alice" });

// Read back this key.
const res = await kv.get(["users", "alice"]);
console.log(res.key); // [ "users", "alice" ]
console.log(res.value); // { name: "Alice" }

env.init();
initPool();
await start(manifest);
