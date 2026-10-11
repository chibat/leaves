import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  srcDir: "./src",
  publicDir: "./static",
  output: "server",
  session: false,
  adapter: cloudflare({
    imageService: "passthrough",
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [preact()],
  alias: {
    "~": root,
  },
});
