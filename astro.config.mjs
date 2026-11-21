import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

const src = fileURLToPath(new URL("./src", import.meta.url));
let commitHash = process.env.GIT_COMMIT_SHA ?? "";
if (!commitHash) {
  try {
    commitHash = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    commitHash = "unknown";
  }
}
const buildTime = process.env.BUILD_TIME ?? new Date().toISOString();

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
    "~": src,
  },
  vite: {
    define: {
      "import.meta.env.PUBLIC_COMMIT_HASH": JSON.stringify(commitHash),
      "import.meta.env.PUBLIC_BUILD_TIME": JSON.stringify(buildTime),
    },
    optimizeDeps: {
      include: ["preact", "preact/hooks", "preact/devtools"],
    },
  },
});
