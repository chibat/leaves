import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { voidReact } from "@void/react/plugin";
import { defineConfig } from "vite";
import { voidPlugin } from "void";

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
  publicDir: "static",
  plugins: [voidPlugin(), voidReact()],
  resolve: {
    alias: {
      "~": src,
    },
  },
  define: {
    "import.meta.env.PUBLIC_COMMIT_HASH": JSON.stringify(commitHash),
    "import.meta.env.PUBLIC_BUILD_TIME": JSON.stringify(buildTime),
  },
});
