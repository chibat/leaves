import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const workerDir = resolve(
  projectRoot,
  ".cloudflare/output/v1/workers/default",
);
const sourceConfigPath = resolve(workerDir, "worker.config.json");
const wranglerConfigPath = resolve(workerDir, "wrangler.jsonc");
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--dry-run")) {
  throw new Error("Only the --dry-run option is supported.");
}
if (!existsSync(sourceConfigPath)) {
  throw new Error("Void Worker output is missing; run the build first.");
}

const worker = JSON.parse(readFileSync(sourceConfigPath, "utf8"));
if (
  typeof worker.name !== "string" ||
  typeof worker.compatibilityDate !== "string" ||
  !Array.isArray(worker.compatibilityFlags) ||
  typeof worker.manifest?.mainModule !== "string" ||
  typeof worker.assets?.notFoundHandling !== "string" ||
  !Array.isArray(worker.assets?.runWorkerFirst)
) {
  throw new Error("Void Worker output has an unsupported configuration.");
}

const wranglerConfig = {
  name: worker.name,
  main: `bundle/${worker.manifest.mainModule}`,
  compatibility_date: worker.compatibilityDate,
  compatibility_flags: worker.compatibilityFlags,
  assets: {
    directory: "assets",
    binding: "ASSETS",
    not_found_handling: worker.assets.notFoundHandling,
    run_worker_first: worker.assets.runWorkerFirst,
  },
};
writeFileSync(wranglerConfigPath, `${JSON.stringify(wranglerConfig, null, 2)}\n`);

const result = spawnSync(
  "wrangler",
  [
    "versions",
    "upload",
    "--config",
    wranglerConfigPath,
    "--keep-vars",
    "--preview-alias",
    "staging",
    ...args,
  ],
  { cwd: projectRoot, stdio: "inherit" },
);
if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  process.exitCode = result.status ?? 1;
}
