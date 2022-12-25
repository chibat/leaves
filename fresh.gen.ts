// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/[name].tsx";
import * as $1 from "./routes/api/joke.ts";
import * as $2 from "./routes/callback.tsx";
import * as $3 from "./routes/index.tsx";
import * as $4 from "./routes/post.tsx";
import * as $5 from "./routes/signout.tsx";
import * as $$0 from "./islands/Counter.tsx";
import * as $$1 from "./islands/Header.tsx";

const manifest = {
  routes: {
    "./routes/[name].tsx": $0,
    "./routes/api/joke.ts": $1,
    "./routes/callback.tsx": $2,
    "./routes/index.tsx": $3,
    "./routes/post.tsx": $4,
    "./routes/signout.tsx": $5,
  },
  islands: {
    "./islands/Counter.tsx": $$0,
    "./islands/Header.tsx": $$1,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
